import { ipcRenderer, contextBridge } from 'electron'

// Expose a safer API namespace to avoid conflicts
contextBridge.exposeInMainWorld('electronAPI', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  // Function to check if a file exists
  fileExists: (filePath: string): Promise<boolean> => {
    return ipcRenderer.invoke('file-exists', filePath)
  },
  // Function to resolve file paths to URLs
  resolveFileUrl: (filePath: string): Promise<string> => {
    return ipcRenderer.invoke('resolve-file-url', filePath)
  },
  // Function to transcode audio files to MP3
  transcodeToMp3: (params: { inputPath: string; outputPath: string }): Promise<{ success: boolean; outputPath?: string; error?: string }> => {
    return ipcRenderer.invoke('transcode-to-mp3', params)
  },
  // Function to delete a file
  deleteFile: (filePath: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('delete-file', filePath)
  },
  trimAudio: (params: { inputPath: string; outputPath: string; start: number; end: number }): Promise<{ success: boolean; outputPath?: string; error?: string }> => {
    return ipcRenderer.invoke('trim-audio', params)
  },
  // Clipboard functions
  writeToClipboard: (text: string): Promise<void> => {
    return ipcRenderer.invoke('write-to-clipboard', text)
  },
  readFromClipboard: (): Promise<string> => {
    return ipcRenderer.invoke('read-from-clipboard')
  },
})
