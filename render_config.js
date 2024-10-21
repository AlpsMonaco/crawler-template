function confirmInput() {
  const url = document.getElementById('input').value
  window.electronAPI.setConfigUrl(url)
}