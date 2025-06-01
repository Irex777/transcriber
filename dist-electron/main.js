import { ipcMain, clipboard, app, BrowserWindow, protocol } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { spawnSync, spawn } from "node:child_process";
ipcMain.handle("write-to-clipboard", (_event, text) => {
  clipboard.writeText(text);
});
ipcMain.handle("read-from-clipboard", () => {
  return clipboard.readText();
});
function trimAudio(inputPath, outputPath, start, end) {
  return new Promise((resolve, reject) => {
    console.log(`[Trim] Trimming audio: ${inputPath} -> ${outputPath} (${start}s to ${end}s)`);
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      inputPath,
      // Input file
      "-ss",
      start.toString(),
      // Start time
      "-to",
      end.toString(),
      // End time
      "-c",
      "copy",
      // Copy without re-encoding for speed
      "-y",
      // Overwrite output
      outputPath
    ]);
    ffmpeg.stderr.on("data", (data) => {
      console.log(`[Trim] ${data.toString()}`);
    });
    ffmpeg.on("error", (error) => {
      console.error("[Trim ERROR] FFmpeg error:", error);
      reject(error);
    });
    ffmpeg.on("close", (code) => {
      if (code === 0) {
        console.log(`[Trim] Completed successfully: ${outputPath}`);
        resolve();
      } else {
        console.error(`[Trim ERROR] FFmpeg exited with code ${code}`);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}
function transcodeToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    var _a;
    console.log(`[Transcode] Starting transcoding: ${inputPath} -> ${outputPath}`);
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      inputPath,
      // Input file
      "-c:a",
      "libmp3lame",
      // MP3 codec
      "-q:a",
      "4",
      // Variable bitrate quality (0-9, lower is better but 4 is good enough)
      "-preset",
      "veryfast",
      // Use faster encoding preset
      "-progress",
      "pipe:1",
      // Output progress information
      "-y",
      // Overwrite output file
      outputPath
    ]);
    ffmpeg.on("error", (error) => {
      console.error(`[Transcode ERROR] FFmpeg error: `, error);
      reject(error);
    });
    (_a = ffmpeg.stdout) == null ? void 0 : _a.on("data", (data) => {
      const progress = data.toString();
      if (progress.includes("time=")) {
        console.log(`[Transcode] Progress: ${progress.trim()}`);
      }
    });
    ffmpeg.on("close", (code) => {
      if (code === 0) {
        console.log(`[Transcode] Completed successfully: ${outputPath}`);
        resolve();
      } else {
        console.error(`[Transcode ERROR] FFmpeg exited with code ${code}`);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}
ipcMain.handle("trim-audio", async (_event, { inputPath, outputPath, start, end }) => {
  try {
    await trimAudio(inputPath, outputPath, start, end);
    return { success: true, outputPath };
  } catch (error) {
    console.error(`[IPC Trim ERROR]`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to trim audio"
    };
  }
});
ipcMain.handle("transcode-to-mp3", async (_event, { inputPath, outputPath }) => {
  try {
    await transcodeToMp3(inputPath, outputPath);
    return { success: true, outputPath };
  } catch (error) {
    console.error(`[IPC Transcode ERROR] `, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
});
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      webSecurity: true,
      allowRunningInsecureContent: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.on("close", (event) => {
    app.quit();
  });
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const requestingUrl = (webContents == null ? void 0 : webContents.getURL()) || "unknown";
    console.log(`[Permission] Request for '${permission}' from ${requestingUrl}. Details:`, details);
    if (permission === "media") {
      console.log(`[Permission] Granting 'media' permission.`);
      callback(true);
    } else {
      console.log(`[Permission] Denying '${permission}' permission.`);
      callback(false);
    }
  });
  win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    const requestingUrl = (webContents == null ? void 0 : webContents.getURL()) || requestingOrigin || "unknown";
    console.log(`[Permission] Check for '${permission}' from ${requestingUrl}. Details:`, details);
    if (permission === "media") {
      console.log(`[Permission] Allowing check for 'media'.`);
      return true;
    }
    console.log(`[Permission] Denying check for '${permission}'.`);
    return false;
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  ipcMain.handle("delete-file", async (_event, filePath) => {
    console.log(`[Main] Deleting file: ${filePath}`);
    try {
      await fs.promises.unlink(filePath);
      return { success: true };
    } catch (error) {
      console.error(`[Main] Error deleting file:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete file"
      };
    }
  });
  ipcMain.handle("file-exists", async (_event, filePath) => {
    console.log(`[Main] Checking if file exists: ${filePath}`);
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("resolve-file-url", async (_event, filePath) => {
  console.log(`[Main] Resolving file URL for: ${filePath}`);
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
    const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, "/");
    const fileUrl = `local-file://${encodedPath}`;
    console.log(`[Main] Resolved URL: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error(`[Main] Error resolving file URL:`, error);
    throw new Error(`File not accessible: ${filePath}`);
  }
});
app.whenReady().then(() => {
  protocol.registerStreamProtocol("local-file", (request, callback) => {
    const url = request.url.replace("local-file://", "");
    const filePath = decodeURIComponent(url);
    console.log("[Main] Stream Protocol handler request:", request.url);
    console.log("[Main] Decoded file path for stream:", filePath);
    try {
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        console.error("[Main] Not a file:", filePath);
        return callback({ statusCode: 400, data: Buffer.from("Not a regular file") });
      }
      const extension = path.extname(filePath).toLowerCase();
      let mimeType = "application/octet-stream";
      switch (extension) {
        case ".mp3":
          mimeType = "audio/mpeg";
          break;
        case ".m4a":
          mimeType = "audio/mp4";
          break;
        case ".wav":
          mimeType = "audio/wav";
          break;
        case ".ogg":
          mimeType = "audio/ogg";
          break;
        case ".aac":
          mimeType = "audio/aac";
          break;
        case ".flac":
          mimeType = "audio/flac";
          break;
        default:
          console.warn("[Main] Unknown audio extension:", extension);
      }
      const stream = fs.createReadStream(filePath);
      stream.on("error", (streamError) => {
        console.error("[Main] Stream error:", streamError);
        callback({ statusCode: 500, data: Buffer.from("Stream error occurred") });
      });
      const headers = {
        "Content-Type": mimeType,
        "Content-Length": stats.size.toString(),
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `inline; filename="${path.basename(filePath)}"`
      };
      console.log("[Main] Serving file with headers:", headers);
      return callback({ statusCode: 200, headers, data: stream });
    } catch (error) {
      console.error("[Main] Protocol error:", error);
      return callback({ statusCode: 500, data: Buffer.from("Internal server error") });
    }
  });
  const sdkFlagPath = path.join(process.env.APP_ROOT, ".sdk_installed");
  if (!fs.existsSync(sdkFlagPath)) {
    const pythonExec = "python3";
    const bootstrapScript = path.join(
      process.env.APP_ROOT,
      // Added non-null assertion
      "python_env",
      "bootstrap.py"
    );
    console.log("Running NexaAI SDK bootstrap...");
    const result = spawnSync(pythonExec, [bootstrapScript], {
      cwd: process.env.APP_ROOT,
      stdio: "inherit"
    });
    if (result.status !== 0) {
      console.error("Failed to install NexaAI SDK.");
      app.quit();
      return;
    }
    fs.writeFileSync(sdkFlagPath, "installed");
    console.log("NexaAI SDK installed successfully.");
  }
  createWindow();
});
const jobQueue = [];
let isProcessing = false;
async function processNextJob() {
  var _a, _b;
  if (isProcessing || jobQueue.length === 0) {
    return;
  }
  isProcessing = true;
  const job = jobQueue.shift();
  if (!job) {
    isProcessing = false;
    return;
  }
  const { jobId, filePath, outputPath, language, quality, speakerSensitivity, event } = job;
  console.log(`[Queue] Starting job ${jobId} for file: ${filePath}`);
  const pythonExec = "python3";
  const transcribeScript = path.join(
    process.env.APP_ROOT,
    "python_env",
    "transcribe.py"
  );
  const commandArgs = [
    transcribeScript,
    filePath,
    outputPath
  ];
  if (language) {
    commandArgs.push("--language", language);
  }
  if (quality) {
    commandArgs.push("--model_size", quality);
  }
  if (speakerSensitivity !== void 0) {
    commandArgs.push("--speaker_sensitivity", speakerSensitivity.toString());
  }
  const logCommand = `${pythonExec} ${commandArgs.map((arg) => JSON.stringify(arg)).join(" ")}`;
  console.log(`[Queue] Spawning: ${logCommand}`);
  const proc = spawn(pythonExec, commandArgs, {
    cwd: process.env.APP_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env }
  });
  (_a = proc.stdout) == null ? void 0 : _a.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.startsWith("PROGRESS")) {
        const progress = parseInt(line.replace("PROGRESS", "").trim(), 10);
        event.sender.send("job-progress", { jobId, progress });
      } else if (line.startsWith("DONE")) {
        console.log(`[Queue] Transcription completed signal received for job ${jobId}`);
      } else if (line.trim()) {
        console.log(`[Queue] Job ${jobId} stdout: ${line}`);
      }
    });
  });
  (_b = proc.stderr) == null ? void 0 : _b.on("data", (data) => {
    console.error(`[Queue] Job ${jobId} error: ${data}`);
  });
  proc.on("error", (err) => {
    console.error(`[Queue] Failed to start job ${jobId}: ${err}`);
    event.sender.send("job-error", { jobId, error: err.message });
    isProcessing = false;
    processNextJob();
  });
  proc.on("close", (code) => {
    if (code !== 0) {
      console.error(`[Queue] Job ${jobId} exited with code ${code}`);
      event.sender.send("job-error", { jobId, error: `Exited with code ${code}` });
    } else {
      try {
        console.log(`[Queue] Reading transcript file for job ${jobId}: ${outputPath}`);
        if (!fs.existsSync(outputPath)) {
          console.error(`[Queue] Transcript file does not exist: ${outputPath}`);
          event.sender.send("job-error", { jobId, error: "Transcript file not found" });
        } else {
          const fileContent = fs.readFileSync(outputPath, "utf-8");
          const transcript = JSON.parse(fileContent);
          console.log(`[Queue] Parsed transcript for job ${jobId}`);
          event.sender.send("job-complete", { jobId, outputPath, transcript });
        }
      } catch (err) {
        console.error(`[Queue] Error reading/parsing transcript for job ${jobId}:`, err);
        let errorMessage = "Failed to read transcript";
        if (err instanceof Error) errorMessage += `: ${err.message}`;
        else errorMessage += `: Unknown error occurred`;
        event.sender.send("job-error", { jobId, error: errorMessage });
      }
    }
    isProcessing = false;
    processNextJob();
  });
}
ipcMain.handle("process-with-gemini", async (_event, { jobId, transcriptPath, apiKey, modelName }) => {
  console.log(`[Gemini] Processing transcript for job ${jobId} using model ${modelName || "default"}`);
  try {
    if (!apiKey) {
      throw new Error("Gemini API key was not provided");
    }
    const geminiOutputPath = transcriptPath.replace(".json", "_gemini.json");
    const pythonExec = "python3";
    const geminiScript = path.join(process.env.APP_ROOT, "python_env", "gemini_process.py");
    return new Promise((resolve, reject) => {
      const proc = spawn(pythonExec, [
        geminiScript,
        transcriptPath,
        geminiOutputPath,
        apiKey,
        // Pass the received apiKey to the script
        "--model_name",
        modelName || "gemini-1.5-flash-latest"
        // Pass model name or default
      ], {
        cwd: process.env.APP_ROOT,
        stdio: ["ignore", "pipe", "pipe"]
      });
      let errorOutput = "";
      proc.stdout.on("data", (data) => {
        console.log(`[Gemini] ${data}`);
      });
      proc.stderr.on("data", (data) => {
        errorOutput += data;
        console.error(`[Gemini] Error: ${data}`);
      });
      proc.on("error", (err) => {
        console.error("[Gemini] Failed to start process:", err);
        reject(new Error(`Failed to start Gemini process: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code !== 0) {
          console.error(`[Gemini] Process exited with code ${code}`);
          reject(new Error(`Gemini process failed: ${errorOutput}`));
          return;
        }
        try {
          const processedContent = fs.readFileSync(geminiOutputPath, "utf-8");
          const processedTranscript = JSON.parse(processedContent);
          resolve({ success: true, transcript: processedTranscript });
        } catch (err) {
          console.error("[Gemini] Error reading processed transcript:", err);
          reject(new Error("Failed to read processed transcript"));
        }
      });
    });
  } catch (error) {
    console.error("[Gemini] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
});
ipcMain.on("start-job", (event, { jobId, filePath, outputPath, language, quality, speakerSensitivity }) => {
  console.log(`[Queue] Received job ${jobId} for file: ${filePath}`);
  jobQueue.push({
    jobId,
    filePath,
    outputPath,
    language,
    quality,
    speakerSensitivity,
    event
    // Pass the event object to send replies later
  });
  console.log(`[Queue] Job ${jobId} added. Queue size: ${jobQueue.length}`);
  processNextJob();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
