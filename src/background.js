'use strict'

import { app, protocol, ipcMain, Menu, remote } from 'electron'

import {
	ADD_TO_DOWNLOAD_LIST,
	ROOT_PATH,
	NUMBER,
	AUDIO_RECEIVED,
	VIDEO_RECEIVED,
	VIDEO_TOTAL,
	AUDIO_TOTAL,
	VIDEO_PAGE,
	VIDEO_DATA,
	IS_OLD_VIDEO,
	VIDEO_URL,
	URLS,
	VIDEO_PAGE_NAME,
	TITLE,
	VIDEO_PROGRESS,
	SHARED_OBJECT,
	AUDIO_URL,
	HAS_ERROR,
	UPDATE_PROGRESS,
	MAIN_WINDOW_ID,
	TASK_WINDOW_ID,
	DOWNLOAD_FAILED,
	ERROR,
	TASK_ID,
	DOWNLOAD_FINISHED,
	TASK_STATUS,
	PAUSED_STATUS,
	STOPPED_STATUS,
	DOWNLOADING_STATUS,
	MERGE_FAILED,
	MERGE_FINISHED,
	INDEX,
	ACCEPT_CODE,
	ACCEPT_NAME,
	VIDEO_PAGES,
	AUDIO_PROGRESS,
	OUTPUT,
	VIDEO_PATH,
	AUDIO_PATH,
	ACCEPTS,
	SELECT,
	VIDEO_FINISHED,
	AUDIO_FINISHED,
	START_TASK_WINDOW,
	WAITING_STATUS,
	FOLDER,
	CHANGE_TAB,
	RESUME_TASK, PAUSE_TASK, DELETE_TASK, DELETED_STATUS, WINDOW_CLOSING
} from "./constants";
import * as downloadEngine from "./util/downloadEngine";

const path = require('path')

const mainWindow = require('./mainWindow')
const taskWindow = require('./taskWindow')

var downloadList = [];
var isAvailable = true;

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
	if (mainWindow.checkExists()) {
		mainWindow.createWindow()
	}
	if (taskWindow.checkExists()) {
		taskWindow.createWindow()
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

	global.sharedObject = {
		[MAIN_WINDOW_ID]: -1
	}

	Menu.setApplicationMenu(null)
	mainWindow.createWindow()
	// taskWindow.createWindow()

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

ipcMain.on(WINDOW_CLOSING, (event, args) =>{
	if(args) app.quit()

	if(!isAvailable){
		app.quit()
	}else{
		event.reply(WINDOW_CLOSING, 0)
	}
})

ipcMain.on(RESUME_TASK, (event, args) => {
	var item = downloadList.find(item => { return item[TASK_ID] == args[TASK_ID] })
	if (item == null || item == undefined) return
	var index = downloadList.indexOf(item)
	item[TASK_STATUS] = isAvailable ? DOWNLOADING_STATUS : WAITING_STATUS

	if (isAvailable) tryStartDownload(index, event)

	event.reply(PAUSE_TASK, {
		[INDEX]: index,
		[TASK_STATUS]: item[TASK_STATUS]
	})
})

ipcMain.on(PAUSE_TASK, (event, args) => {
	var item = downloadList.find(item => { return item[TASK_ID] == args[TASK_ID] })
	if (item == null || item == undefined) return
	if (item[TASK_STATUS] == DOWNLOADING_STATUS) {
		downloadEngine.cancel()
		doHandleTaskStopped(downloadList.indexOf(item), event)
	}

	item[TASK_STATUS] = item[TASK_STATUS] == WAITING_STATUS ? PAUSED_STATUS : item[TASK_STATUS]

	event.reply(PAUSE_TASK, {
		[INDEX]: index,
		[TASK_STATUS]: item[TASK_STATUS]
	})
})

ipcMain.on(DELETE_TASK, (event, args) => {
	var item = downloadList.find(item => { return item[TASK_ID] == args[TASK_ID] })
	if (item == null || item == undefined) return
	if (item[TASK_STATUS] == DOWNLOADING_STATUS) {
		downloadEngine.cancel()
		doHandleTaskStopped(downloadList.indexOf(item), event)
	}
	item[TASK_STATUS] = DELETED_STATUS

	event.reply(DELETE_TASK, {
		[INDEX]: index,
		[TASK_STATUS]: item[TASK_STATUS]
	})
})

// receive new tasks, add to list both in main process and downloadlist component
// try to start it
ipcMain.on(ADD_TO_DOWNLOAD_LIST, (event, args) => {
	console.log("add to download list");
	var acceptName = null
	args[VIDEO_DATA][ACCEPTS].forEach(item => {
		if (item[SELECT] > 0) acceptName = item[ACCEPT_NAME];
	});

	var startIndex = downloadList.length

	var folder = path.join(args[ROOT_PATH], args[VIDEO_DATA][TITLE] + args[VIDEO_DATA][NUMBER])

	args[VIDEO_DATA][URLS].forEach(element => {
		var task = {
			[TASK_ID]: new Date().getTime().toString(),
			[ROOT_PATH]: args[ROOT_PATH],
			[TITLE]: args[VIDEO_DATA][TITLE],
			[NUMBER]: args[VIDEO_DATA][NUMBER],
			[ACCEPT_NAME]: acceptName,
			[AUDIO_RECEIVED]: 0,
			[VIDEO_RECEIVED]: 0,
			[VIDEO_TOTAL]: 0,
			[AUDIO_TOTAL]: 0,
			[TASK_STATUS]: WAITING_STATUS,
			[VIDEO_PAGE]: element[VIDEO_PAGE],
			[VIDEO_PAGE_NAME]: element[VIDEO_PAGE_NAME],
			[IS_OLD_VIDEO]: args[VIDEO_DATA][IS_OLD_VIDEO],
			[VIDEO_URL]: element[VIDEO_URL],
			[AUDIO_URL]: element[AUDIO_URL],
			[FOLDER]: folder,
			[VIDEO_PATH]: path.join(folder, element[VIDEO_PAGE_NAME] + "-v-" + acceptName + ".m4s"),
			[AUDIO_PATH]: path.join(folder, element[VIDEO_PAGE_NAME] + "-a-" + acceptName + ".m4s"),
			[OUTPUT]: path.join(folder, element[VIDEO_PAGE] + "-" + element[VIDEO_PAGE_NAME] + "-" + acceptName + ".flv"),
			[HAS_ERROR]: false,
			[ERROR]: null
		};
		downloadList.push(task);
		event.reply(ADD_TO_DOWNLOAD_LIST, task)
	});

	tryStartDownload(startIndex, event);
});

// try to download
function tryStartDownload(index, event) {

	if (index < 0 || index >= downloadList.length) return

	var item = downloadList[index];

	if (!isAvailable) {
		item[TASK_STATUS] = WAITING_STATUS
		return
	}

	doStartDownload(index, event);
}

function doStartDownload(index, event) {
	console.log("doStartDownload");

	isAvailable = false;

	var item = downloadList[index];
	item[TASK_STATUS] = DOWNLOADING_STATUS;

	downloadEngine
		.startDownload(item, (type, received_bytes, total_bytes) => {
			updateProgressCallback(index, type, received_bytes, total_bytes, event)
		})
		.then(() => {
			// item[TASK_STATUS] = PAUSED_STATUS;
			console.log("background.js download finished")
			downloadFinished(index, event);
			doHandleTaskStopped(index, event);
		})
		.catch(error => {
			item[HAS_ERROR] = true;
			item[ERROR] = error;
			item[TASK_STATUS] = STOPPED_STATUS;
			downloadFailed(index, event);
			doHandleTaskStopped(index, event);
		});
}

// only download finished, need to merge
function downloadFinished(index, event) {

	if (downloadList[index][IS_OLD_VIDEO]) {
		event.reply(MERGE_FINISHED, {
			[INDEX]: index,
			[TASK_ID]: downloadList[index][TASK_ID]
		});
	} else {
		var taskWinId = taskWindow.createWindow()
		console.log("download finished, start merge window and send its id to main window")
		event.reply(DOWNLOAD_FINISHED, {
			[INDEX]: index,
			[TASK_ID]: downloadList[index][TASK_ID],
			[TASK_WINDOW_ID]: taskWinId
		});
	}
	//   downloadEngine
	//     .mergeFiles(item[ROOT_PATH], item[NUMBER], item[VIDEO_PAGE])
	//     .then(() => {
	//       mergeFinished(index);
	//     })
	//     .catch(() => {
	//       mergeFailed(index);
	//     });
}

function downloadFailed(index, event) {
	var item = downloadList[index];

	if (item[IS_OLD_VIDEO]) {
		event.reply(MERGE_FAILED, {
			[INDEX]: index,
			[TASK_ID]: downloadList[index][TASK_ID],
			[ERROR]: item[ERROR]
		});
	} else {
		event.reply(DOWNLOAD_FAILED, {
			[INDEX]: index,
			[TASK_ID]: item[TASK_ID],
			[ERROR]: item[ERROR]
		});
	}
}

// function mergeFinished(index, event) {
//   var item = downloadList[index];
//   event.reply(MERGE_FINISHED, item);

//   doHandleTaskStopped(index);
// }

// function mergeFailed(index, event) {
//   var item = downloadList[index];
//   event.reply(MERGE_FAILED, item);

//   doHandleTaskStopped(index);
// }

function doHandleTaskStopped(index, event) {
	// downloadList.slice(index, index + 1);
	isAvailable = true;
	var nextIndex = downloadList.findIndex(item => { return item[TASK_STATUS] == WAITING_STATUS })
	console.log("one finsihed, start next " + nextIndex)
	tryStartDownload(nextIndex, event)
}

function updateProgressCallback(index, type, received_bytes, total_bytes, event) {

	var item = downloadList[index];
	if (type === VIDEO_PROGRESS) {
		item[VIDEO_TOTAL] = total_bytes;
		item[VIDEO_RECEIVED] = received_bytes;
	} else {
		item[AUDIO_TOTAL] = total_bytes;
		item[AUDIO_RECEIVED] = received_bytes;
	}
	event.reply(UPDATE_PROGRESS, {
		[INDEX]: index,
		[TASK_ID]: item[TASK_ID],
		[VIDEO_RECEIVED]: item[VIDEO_RECEIVED],
		[VIDEO_TOTAL]: item[VIDEO_TOTAL],
		[AUDIO_RECEIVED]: item[AUDIO_RECEIVED],
		[AUDIO_TOTAL]: item[AUDIO_TOTAL]
	});
}

// when download is triggered, ipcRnederer send tab index to main process to change tab
// ipcMain send index back to renderer process, but only received in App.vue
ipcMain.on(CHANGE_TAB, (event, args) => {
	event.reply(CHANGE_TAB, args)
})