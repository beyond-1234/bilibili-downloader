<template >
  <div></div>
</template>
<script>
import { ipcRenderer } from "electron";
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
  DOWNLOAD_FAILED,
  ERROR,
  TASK_ID,
  DOWNLOAD_FINISHED,
  TASK_STATUS,
  PAUSED_STATUS,
  STOPPED_STATUS,
  DOWNLOADING_STATUS,
  MERGE_FAILED,
  MERGE_FINISHED
} from "../../constants";
import * as downloadEngine from "../../util/downloadEngine";

// taskWindow为中心，home组件的信息先传到taskWindow，由taskWindow管理，再发到downloadList组件
// taskWindow向downloadList组件更新下载进度
// decrepted 应用刚开始跑的时候taskWindow从localStorage里拿到缓存的list，再发给downloadList组件
// 每个任务都要有下载中\暂停\stopped种状态，当一个任务完成或者失败，放到mainWindow相应的组件中的list里，需要重新下载的时候在发消息给taskWindow
// 我知道ipc要走主进程，我知道效率低，但我不打算改了。就这样

// var downloadList = [];
// var isAvailable = true;
// var mainWinId = require("electron").remote.getGlobal(SHARED_OBJECT)[
//   MAIN_WINDOW_ID
// ];


// ipcRenderer.on(ADD_TO_DOWNLOAD_LIST, async (event, args) => {
//   console.log("add to download list");

//   var startIndex = downloadList.length
//     console.log(args)
//   args[URLS].forEach(element => {
//     var task = {
//       [TASK_ID]: new Date().getTime().toString(),
//       [ROOT_PATH]: args[ROOT_PATH],
//       [TITLE]: args[VIDEO_DATA][TITLE],
//       [NUMBER]: args[VIDEO_DATA][NUMBER],
//       [AUDIO_RECEIVED]: 0,
//       [VIDEO_RECEIVED]: 0,
//       [VIDEO_TOTAL]: 0,
//       [AUDIO_TOTAL]: 0,
//       [TASK_STATUS]: PAUSED_STATUS,
//       [VIDEO_PAGE]: element[VIDEO_PAGE],
//       [VIDEO_PAGE_NAME]: element[VIDEO_PAGE_NAME],
//       [IS_OLD_VIDEO]: args[VIDEO_DATA][IS_OLD_VIDEO],
//       [VIDEO_URL]: element[VIDEO_URL],
//       [AUDIO_URL]: element[AUDIO_URL],
//       [HAS_ERROR]: false,
//       [ERROR]: null
//     };
//     downloadList.push(task);
//   });

// // console.log(downloadList);
//   tryStartDownload(startIndex);
// });

// function tryStartDownload(index) {
//   console.log("tryStartDownload" + index);

//   var item = downloadList[index];
//   console.log(JSON.stringify(item));

//   if (item === undefined || item === null) {
//     return;
//   }

//   console.log("tryStartDownload2");
//   if (!isAvailable) return;
//   console.log("tryStartDownload3");

//   doStartDownload(index);
// }

// function doStartDownload(index) {
//   console.log("doStartDownload");

//   isAvailable = false;

//   var item = downloadList[index];
//   item[TASK_STATUS] = DOWNLOADING_STATUS;
//   downloadEngine
//     .startDownload(index, item, updateProgressCallback)
//     .then(() => {
//       item[TASK_STATUS] = PAUSED_STATUS;
//       downloadFinished(index);
//     })
//     .catch(error => {
//       console.log(error);
//       item[HAS_ERROR] = true;
//       item[ERROR] = error;
//       item[TASK_STATUS] = STOPPED_STATUS;
//       downloadFailed(index);
//     });
// }

// function downloadFinished(index) {
//   var item = downloadList[index];
//   ipcRenderer.sendTo(mainWinId, DOWNLOAD_FINISHED, item);

//   downloadEngine
//     .mergeFiles(item[ROOT_PATH], item[NUMBER], item[VIDEO_PAGE])
//     .then(() => {
//       mergeFinished(index);
//     })
//     .catch(() => {
//       mergeFailed(index);
//     });
// }

// function downloadFailed(index) {
//   var item = downloadList[index];
//   ipcRenderer.sendTo(mainWinId, DOWNLOAD_FAILED, item);

//   doHandleTaskStopped(index);
// }

// function mergeFinished(index) {
//   var item = downloadList[index];
//   ipcRenderer.sendTo(mainWinId, MERGE_FINISHED, item);

//   doHandleTaskStopped(index);
// }

// function mergeFailed(index) {
//   var item = downloadList[index];
//   ipcRenderer.sendTo(mainWinId, MERGE_FAILED, item);

//   doHandleTaskStopped(index);
// }

// function doHandleTaskStopped(index) {
//   downloadList.slice(index, index + 1);
//   isAvailable = true;
// }

// function updateProgressCallback(index, type, received_bytes, total_bytes) {
//   console.log("update progress");

//   var item = downloadList[index];
//   if (type === VIDEO_PROGRESS) {
//     item[VIDEO_TOTAL] = total_bytes;
//     item[VIDEO_RECEIVED] = received_bytes;
//   } else {
//     item[AUDIO_TOTAL] = total_bytes;
//     item[AUDIO_RECEIVED] = received_bytes;
//   }
//   ipcRenderer.sendTo(mainWinId, UPDATE_PROGRESS, {
//     [TASK_ID]: item[TASK_ID],
//     [VIDEO_RECEIVED]: item[VIDEO_RECEIVED],
//     [VIDEO_TOTAL]: item[VIDEO_TOTAL],
//     [AUDIO_RECEIVED]: item[AUDIO_RECEIVED],
//     [AUDIO_TOTAL]: item[AUDIO_TOTAL]
//   });
// }

export default {
  name: "task",
  props: [],
  data() {
    return {};
  }
};
</script>

