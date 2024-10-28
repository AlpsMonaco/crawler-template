const { ipcRenderer } = require("electron/renderer")

const crawlConfig = {
  enableCrawling: false,
  crawlingInterval: 3000
}

ipcRenderer.on('set-is-crawl', (sender, msg) => {
  crawlConfig.enableCrawling = msg
})

ipcRenderer.on('set-crawler-interval', (sender, msg) => {
  crawlConfig.crawlingInterval = msg
})

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function switchCrawlingState(state) {
  crawlConfig.enableCrawling = state
}

function setCrawlingInterval(interval) {
  if (typeof interval == "number" || typeof interval == "bigint") {
    crawlConfig.crawlingInterval = interval
  }
}

let performCrawling = async function () {
  throw ("not logic")
}

async function startCrawlingLoop() {
  for (; ;) {
    await sleep(crawlConfig.crawlingInterval)
    if (!crawlConfig.enableCrawling) {
      continue
    }
    await performCrawling()
  }
}

performCrawling = async function () {
  const elemList = document.getElementsByClassName("entry-list list")
  if (elemList) {
    console.log(elemList)
    if (elemList[0] && elemList[0].children) {
      for (let v of elemList[0].children) {
        console.log(v)
      }
      switchCrawlingState(false)
    }
    return
  }
}

startCrawlingLoop()