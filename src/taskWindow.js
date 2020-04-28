import { BrowserWindow } from 'electron'
import { join } from 'path'
import {
	createProtocol,
	/* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let taskWin

export function createWindow() {
    // Create the browser window.
    taskWin = new BrowserWindow({
        show: true,
        width: 1024,
        height: 768,
        resizable: false,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: true,
            webSecurity: false
        }
    })

    taskWin.loadFile('merger/merge.html')

    taskWin.webContents.openDevTools()

    global.sharedObject["mergeWindowId"] = taskWin.webContents.id

    console.log(JSON.stringify(global.sharedObject))

    if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
		if (!process.env.IS_TEST) win.webContents.openDevTools()
	} else {
		createProtocol('app')
		// Load the index.html when not in development
		win.loadURL('app://./index.html')
	}

    // Emitted when the window is closed.
    taskWin.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        taskWin = null
    })

}

export function closeWindow() {
    if (taskWin != null) {
        taskWin.close()
    }
}

