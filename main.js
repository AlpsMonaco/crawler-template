const { writeFile, readFile } = require('fs/promises')
const { Menu, app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

const config = {
  width: 800,
  height: 600,
  maxmize: false,
  url: null
}

async function saveConfig() {
  const data = JSON.stringify(config)
  await writeFile("config.json", data)
}

let isConfigLoaded = false
async function loadConfig() {
  if (isConfigLoaded) return
  try {
    const data = JSON.parse(await readFile("config.json"))
    config.width = data.width
    config.height = data.height
    config.maxmize = data.maxmize
    isConfigLoaded = true
  } catch (e) {
    console.error(e)
  }
}

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
    console.log(url)
    configWindow.close()
  }
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
