import { BrowserWindow, webFrame } from 'electron'
import { join } from 'path'
import {
	createProtocol,
	/* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
import { TASK_WINDOW_ID, START_DOWNLOAD } from './constants'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let taskWin

export function createWindow() {
    // Create the browser window.
    taskWin = new BrowserWindow({
        show: false,
        width: 1024,
        height: 768,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    })

    global.sharedObject[TASK_WINDOW_ID] = taskWin.webContents.id

    // taskWin.loadFile('task/task.html')
    // taskWin.loadURL('app://./task.html')

    taskWin.webContents.openDevTools()

    // taskWin.loadURL("http://www.bilibili.com")

    if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		taskWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
		if (!process.env.IS_TEST) taskWin.webContents.openDevTools()
	} else {
		createProtocol('app')
		// Load the index.html when not in development
		taskWin.loadFile('app://./index.html')
	}

    // Emitted when the window is closed.
    taskWin.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        taskWin = null
    })

}

export function checkExists(){
    return taskWin == null
}

export function closeWindow() {
    if (taskWin != null) {
        taskWin.close()
    }
}

export function getId(){
	if(taskWin == null){
		return -1
	}else{
		return taskWin.webContents.id
	}
}
