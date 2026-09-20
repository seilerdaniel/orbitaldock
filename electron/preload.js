// OrbitalDock — Preload (contextBridge aislado)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openVscode: (rutaLocal) => ipcRenderer.invoke('open-vscode', rutaLocal),
  openFolder: (rutaLocal) => ipcRenderer.invoke('open-folder', rutaLocal),
  checkHealth: (payload) => ipcRenderer.invoke('check-health', payload),
  getGitStatus: (rutaLocal) => ipcRenderer.invoke('get-git-status', rutaLocal),
  runOpenCodePrompt: (rutaLocal, promptText) => ipcRenderer.invoke('run-opencode-prompt', { rutaLocal, promptText }),
  showNotification: (payload) => ipcRenderer.invoke('show-notification', payload),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data')
});
