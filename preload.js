const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld('electronAPI', {
  refreshLog: (s) => { return ipcRenderer.invoke('refresh-log', s) }
})

ipcRenderer.on('clear-log', (sender, msg) => {
  document.getElementById("log-content").innerHTML = ""
})

ipcRenderer.on('append-log', (sender, msg) => {
  document.getElementById("log-content").innerHTML += msg
  document.getElementById("log-content").innerHTML += '\n'
})

ipcRenderer.on('scroll-to-bottom', (sender, msg) => {
  const elem = document.getElementById("log-content")
  elem.scrollTop = elem.scrollHeight
})