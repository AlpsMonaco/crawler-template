const { ipcRenderer } = require("electron/renderer")

ipcRenderer.on('perform-crawling', async (sender, msg) => {
  try {
    let result = await performCrawling()
    ipcRenderer.send('crawl-done', result)
  } catch (e) {
    ipcRenderer.send('crawl-error', e)
  }
})

async function performCrawling() {
  const elemList = document.getElementsByClassName("entry-list list")
  if (elemList) {
    console.log(elemList)
    if (elemList[0] && elemList[0].children) {
      for (let v of elemList[0].children) {
        console.log(v)
      }
      setEnableCrawling(false)
    }
    return
  }
}