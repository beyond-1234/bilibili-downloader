'use strict'

import { BrowserWindow, app, ipcMain } from 'electron'
import {
	createProtocol,
	/* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
import { MAIN_WINDOW_ID, WINDOW_CLOSING, READY_FOR_CLOSING } from './constants'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
var readyForClosing = false

export function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
        width: 1024,
		height: 768,
		title: "Main",
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false
		}
	})

	global.sharedObject[MAIN_WINDOW_ID] = win.webContents.id

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
		if (!process.env.IS_TEST) win.webContents.openDevTools()
	} else {
		createProtocol('app')
		// Load the index.html when not in development
		win.loadURL('app://./index.html')
	}

	win.on('onbeforeunload', (e) => {
		if(readyForClosing)
			e.preventDefault()
		console.log("main window closed")
		// app.quit()
		win.webContents.send(WINDOW_CLOSING, 0)
	})

	win.on('closed', () => {
	})
}

ipcMain.on(READY_FOR_CLOSING, (event, args) => {
	console.log("ready for closing")
	readyForClosing = true
	app.quit()
})

export function checkExists(){
	return win == null
}

export function closeWindow() {
    if (win != null) {
        win.close()
    }
}

export function getId(){
	if(win == null){
		return -1
	}else{
		return win.webContents.id
	}
}