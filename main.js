const { readFile } = require('fs/promises')
const { Menu, app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const { config, saveConfig, loadConfig } = require('./config')
const { time } = require('./util')
const { Log } = require('./log')



let mainWindow = null
let configWindow = null

async function createMainWindow() {
  await loadConfig()
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.webContents.openDevTools()
  const menu = Menu.buildFromTemplate(
    [
      {
        label: '选项',
        submenu: [
          {
            label: '打开控制台',
            click: () => { mainWindow.webContents.openDevTools() }
          },
          {
            label: '刷新',
            click: () => { mainWindow.reload() }
          },
          {
            click: () => createConfigWindow(),
            label: '配置地址'
          },
        ]
      }
    ])
  mainWindow.setMenu(menu)
  mainWindow.loadFile('index.html')
  if (config.maxmize) { mainWindow.maximize() }
  mainWindow.loadFile('index.html')
  mainWindow.on("maximize", () => {
    config.maxmize = true
    saveConfig()
  })
  mainWindow.on("unmaximize", () => {
    config.maxmize = false
    saveConfig()
  })
  mainWindow.on("resized", function () {
    const size = mainWindow.getSize()
    config.width = size[0]
    config.height = size[1]
    saveConfig()
  })
}

async function createConfigWindow() {
  await loadConfig()
  const windowConfig = {
    minimizable: false,
    maximizable: false,
    parent: mainWindow,
    modal: true,
    width: 600,
    height: 150,
    webPreferences: {
      preload: path.join(__dirname, 'preload_config.js')
    }
  }
  configWindow = new BrowserWindow(windowConfig)
  // configWindow.webContents.openDevTools()
  configWindow.loadFile("config.html")
  configWindow.setMenuBarVisibility(false)
  configWindow.addListener('close', () => {
    configWindow = null
    mainWindow.focus()
  })
}

app.whenReady().then(() => {
  createMainWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

ipcMain.on('url-config', (event, url) => {
  if (configWindow) {
    config.url = url
    saveConfig().then(() => {
      configWindow.close()
    })
  }
})

const log = Log()

ipcMain.handle('get-config-url', () => {
  return config.url ? config.url : ""
})

ipcMain.handle('refresh-log', (sender, s) => {
  log.write('[' + time.getLocalTime() + "] " + s)
  mainWindow.webContents.send('clear-log')
  log.iter(s => {
    mainWindow.webContents.send('append-log', s)
  })
  mainWindow.webContents.send('scroll-to-bottom')
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
