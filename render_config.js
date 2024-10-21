function confirmInput() {
  const url = document.getElementById('input').value
  window.electronAPI.setConfigUrl(url)
}

function renderUrl() {
  window.electronAPI.getConfigUrl().then(url => {
    console.log(url)
    document.getElementById('input').value = url })
}