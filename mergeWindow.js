const { BrowserWindow, Menu } = require('electron')
const path = require('path')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
exports.mergeWin

exports.createWindow = () => {
    // Create the browser window.
    mergeWin = new BrowserWindow({
        show: false,
        width: 1024,
        height: 768,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    mergeWin.loadFile('merger/merge.html')

    Menu.setApplicationMenu(null)

    mergeWin.webContents.openDevTools()

    global.sharedObject["mergeWindowId"] = mergeWin.webContents.id

    console.log(JSON.stringify(global.sharedObject))

    // Emitted when the window is closed.
    mergeWin.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mergeWin = null
    })

}

exports.closeWindow = () => {
    if (mergeWin != null) {
        mergeWin.close()
    }
}

