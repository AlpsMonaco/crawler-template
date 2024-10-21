const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld('electronAPI', {
  setConfigUrl: (url) => ipcRenderer.send('url-config', url)
})