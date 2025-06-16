"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...data] = args;
    return electron.ipcRenderer.send(channel, ...data);
  },
  invoke(...args) {
    const [channel, ...data] = args;
    return electron.ipcRenderer.invoke(channel, ...data);
  },
  // Function to check if a file exists
  fileExists: (filePath) => {
    return electron.ipcRenderer.invoke("file-exists", filePath);
  },
  // Function to resolve file paths to URLs
  resolveFileUrl: (filePath) => {
    return electron.ipcRenderer.invoke("resolve-file-url", filePath);
  },
  // Function to transcode audio files to MP3
  transcodeToMp3: (params) => {
    return electron.ipcRenderer.invoke("transcode-to-mp3", params);
  },
  // Function to delete a file
  deleteFile: (filePath) => {
    return electron.ipcRenderer.invoke("delete-file", filePath);
  },
  trimAudio: (params) => {
    return electron.ipcRenderer.invoke("trim-audio", params);
  },
  // Clipboard functions
  writeToClipboard: (text) => {
    return electron.ipcRenderer.invoke("write-to-clipboard", text);
  },
  readFromClipboard: () => {
    return electron.ipcRenderer.invoke("read-from-clipboard");
  },
  // File cleanup functions
  cleanupJobFiles: (jobId) => {
    return electron.ipcRenderer.invoke("cleanup-job-files", jobId);
  },
  cleanupAllFiles: () => {
    return electron.ipcRenderer.invoke("cleanup-all-files");
  },
  getFileStats: (jobId) => {
    return electron.ipcRenderer.invoke("get-file-stats", jobId);
  }
});
