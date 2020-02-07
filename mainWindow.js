const { BrowserWindow, Menu, app } = require('electron')
const path = require('path')
const mergeWindow = require('./mergeWindow')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
exports.mainWin


exports.createWindow = () => {
  // Create the browser window.
  mainWin = new BrowserWindow({
    width: 1024,
    height: 768,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'util/icon-512x512.png')
  })

  Menu.setApplicationMenu(null)

  global.sharedObject = {
    "mainWindowId": 1,
    "mergeWindowId": 2
  }

  global.sharedObject["mainWindowId"] = mainWin.webContents.id

  console.log(JSON.stringify(global.sharedObject))

  // and load the index.html of the app.
  mainWin.loadFile('renderer/main.html')

  // Open the DevTools.
  // mainWin.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWin.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWin = null
    app.quit()
  })

}
