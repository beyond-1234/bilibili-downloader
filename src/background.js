'use strict'

import { app, protocol, ipcMain, Menu } from 'electron'
import { startDownload } from "./constants";
const mainWindow = require('./mainWindow')


const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		mainWindow.createWindow()
	}
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		// Devtools extensions are broken in Electron 6.0.0 and greater
		// See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
		// Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
		// If you are not using Windows 10 dark mode, you may uncomment these lines
		// In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
		// try {
		//   await installVueDevtools()
		// } catch (e) {
		//   console.error('Vue Devtools failed to install:', e.toString())
		// }

	}
	Menu.setApplicationMenu(null)
	mainWindow.createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', data => {
			if (data === 'graceful-exit') {
				app.quit()
			}
		})
	} else {
		process.on('SIGTERM', () => {
			app.quit()
		})
	}
}

// user started a download task
// create new task window(hidden) to download
// notify ui to generate new download progress item
ipcMain.on(startDownload, () => {
	
})