const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')


require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
});

function createWindow () {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1366,
    height: 768,
    minWidth: 1366,
    minHeight: 768,
    // maxWidth: 1366,
    // maxHeight: 768,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  mainWindow.loadFile('index.html')
  // eliminar la barra de menu
  // mainWindow.removeMenu()

  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}


app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  // globalShortcut.register('CommandOrControl+R', () => {})
  // globalShortcut.register('CommandOrControl+Shift+R', () => {})
  // globalShortcut.register('F5', () => {})
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})