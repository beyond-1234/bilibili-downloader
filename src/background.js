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
	AUDIO_FINISHED
} from "./constants";
import * as downloadEngine from "./util/downloadEngine";


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
		[MAIN_WINDOW_ID]: -1,
		[TASK_WINDOW_ID]: -1
	}

	Menu.setApplicationMenu(null)
	mainWindow.createWindow()
	taskWindow.createWindow()

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
// background为中心，home组件的信息先传到background，由background管理，再发到downloadList组件
// background向downloadList组件更新下载进度
// decrepted 应用刚开始跑的时候background从localStorage里拿到缓存的list，再发给downloadList组件
// 每个任务都要有下载中\暂停\stopped种状态，当一个任务完成或者失败，放到mainWindow相应的组件中的list里，需要重新下载的时候在发消息给background
// 我知道ipc要走主进程，我知道效率低，但我不打算改了。就这样

// var mainWinId = require("electron").remote.getGlobal(SHARED_OBJECT)[
// 	MAIN_WINDOW_ID
// ];


ipcMain.on(ADD_TO_DOWNLOAD_LIST, (event, args) => {
	console.log("add to download list");

	var acceptName = null
	args[VIDEO_DATA][ACCEPTS].forEach(item => {
		if (item[SELECT] > 0) acceptName = item[ACCEPT_NAME];
	});

	var startIndex = downloadList.length
	console.log(args)
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
			[TASK_STATUS]: PAUSED_STATUS,
			[VIDEO_PAGE]: element[VIDEO_PAGE],
			[VIDEO_PAGE_NAME]: element[VIDEO_PAGE_NAME],
			[IS_OLD_VIDEO]: args[VIDEO_DATA][IS_OLD_VIDEO],
			[VIDEO_URL]: element[VIDEO_URL],
			[AUDIO_URL]: element[AUDIO_URL],
			[VIDEO_PATH]: `${args[ROOT_PATH]}/${args[VIDEO_DATA][NUMBER]}/${element[VIDEO_PAGE_NAME]}-v-${acceptName}.m4s`,
			[AUDIO_PATH]: `${args[ROOT_PATH]}/${args[VIDEO_DATA][NUMBER]}/${element[VIDEO_PAGE_NAME]}-a-${acceptName}.m4s`,
			[OUTPUT]: `${args[ROOT_PATH]}/${args[VIDEO_DATA][NUMBER]}/${element[VIDEO_PAGE_NAME]}-${acceptName}.flv`,
			// [VIDEO_FINISHED]: args[VIDEO_DATA][VIDEO_FINISHED],
			// [AUDIO_FINISHED]: args[VIDEO_DATA][AUDIO_FINISHED],
			[HAS_ERROR]: false,
			[ERROR]: null
		};
		downloadList.push(task);
	});

	console.log(downloadList.length);
	tryStartDownload(startIndex, event);
});

function tryStartDownload(index, event) {
	console.log("tryStartDownload" + index);

	var item = downloadList[index];

	if (item === undefined || item === null) {
		return;
	}

	if (!isAvailable) return;

	doStartDownload(index, event);
}

function doStartDownload(index, event) {
	console.log("doStartDownload");

	isAvailable = false;

	var item = downloadList[index];
	item[TASK_STATUS] = DOWNLOADING_STATUS;

	event.reply(ADD_TO_DOWNLOAD_LIST, item)

	downloadEngine
		.startDownload(item, (type, received_bytes, total_bytes) => {
			updateProgressCallback(index, type, received_bytes, total_bytes, event)
		})
		.then(() => {
			item[TASK_STATUS] = PAUSED_STATUS;
			downloadFinished(index, event);
		})
		.catch(error => {
			console.log(error);
			item[HAS_ERROR] = true;
			item[ERROR] = error;
			item[TASK_STATUS] = STOPPED_STATUS;
			downloadFailed(index, event);
		});
}

// only download finished, need to merge
function downloadFinished(index, event) {
	event.reply(DOWNLOAD_FINISHED, {
		[INDEX]:index,
		[TASK_ID]: downloadList[index][TASK_ID]
	});

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
	event.reply(DOWNLOAD_FAILED, {
		[INDEX]:index,
		[TASK_ID]: item[TASK_ID],
		[ERROR]: item[ERROR]
	});

	doHandleTaskStopped(index);
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

function doHandleTaskStopped(index) {
	downloadList.slice(index, index + 1);
	isAvailable = true;
}

function updateProgressCallback(index, type, received_bytes, total_bytes, event) {
	console.log("update progress");

	var item = downloadList[index];
	if (type === VIDEO_PROGRESS) {
		item[VIDEO_TOTAL] = total_bytes;
		item[VIDEO_RECEIVED] = received_bytes;
	} else {
		item[AUDIO_TOTAL] = total_bytes;
		item[AUDIO_RECEIVED] = received_bytes;
	}
	event.reply(UPDATE_PROGRESS, {
		[INDEX]:index,
		[TASK_ID]: item[TASK_ID],
		[VIDEO_RECEIVED]: item[VIDEO_RECEIVED],
		[VIDEO_TOTAL]: item[VIDEO_TOTAL],
		[AUDIO_RECEIVED]: item[AUDIO_RECEIVED],
		[AUDIO_TOTAL]: item[AUDIO_TOTAL]
	});
}