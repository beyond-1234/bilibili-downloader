'use strict'

import { BrowserWindow } from 'electron'
import {
	createProtocol,
	/* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

export function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		width: 800, height: 600, webPreferences: {
			nodeIntegration: true,
			webSecurity: false
		}
	})


	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
		if (!process.env.IS_TEST) win.webContents.openDevTools()
	} else {
		createProtocol('app')
		// Load the index.html when not in development
		win.loadURL('app://./index.html')
	}

	win.on('closed', () => {
		win = null
	})
}

