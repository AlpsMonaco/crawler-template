const { writeFile, readFile } = require('fs/promises')

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
    config.url = data.url
    isConfigLoaded = true
  } catch (e) {
    console.error(e)
  }
}

module.exports = { config, saveConfig, loadConfig }