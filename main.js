const { Menu, app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const { config, saveConfig, loadConfig } = require('./config')
const { time } = require('./util')
const { Log } = require('./log')

let mainWindow = null
let configWindow = null
let crawlerWindow = null

async function openCrawlerWindow() {
  await loadConfig()
  if (!crawlerWindow) {
    crawlerWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      webPreferences: {
        preload: path.join(__dirname, 'preload_crawler.js')
      },
      maximizable: false,
      closable: false,
    })
    crawlerWindow.webContents.openDevTools()
    crawlerWindow.loadURL(config.url.indexOf("http") == -1 ? "http://" + config.url : config.url)
    crawlerWindow.setMenuBarVisibility(false)
    crawlerWindow.on('minimize', () => {
      crawlerWindow.hide()
    })
  } else {
    crawlerWindow.show()
  }
}

async function createMainWindow() {
  await loadConfig()
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  const menu = Menu.buildFromTemplate(
    [
      {
        label: '选项',
        submenu: [
          {
            label: '配置地址',
            click: () => createConfigWindow(),
          },
          {
            label: '显示实时窗口',
            click: () => openCrawlerWindow(),
          },
          {
            label: '打开控制台',
            click: () => { mainWindow.webContents.openDevTools() }
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
  mainWindow.on('close', () => {
    if (crawlerWindow){ 
      crawlerWindow.closable = true
      crawlerWindow.close()
    }
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
