import { ipcRenderer } from "electron";
import { START_DOWNLOAD, ROOT_PATH, NUMBER, AUDIO_RECEIVED, VIDEO_RECEIVED, VIDEO_PAGE, VIDEO_DATA, IS_OLD_VIDEO, VIDEO_URL, URLS, VIDEO_PAGE_NAME, TITLE } from "../constants";

var downloadList = []

ipcRenderer.on(START_DOWNLOAD, (event, args) => {
    
    args[VIDEO_DATA][URLS].forEach(element => {
        var task = {
            [DOWNLOAD_ID]: new Date().getTime().toString(),
            [ROOT_PATH]: args[ROOT_PATH],
            [TITLE]: args[VIDEO_DATA][TITLE],
            [NUMBER]:args[VIDEO_DATA][NUMBER],
            [AUDIO_RECEIVED]: 0,
            [VIDEO_RECEIVED]: 0,
            [VIDEO_PAGE]:element[VIDEO_PAGE],
            [VIDEO_PAGE_NAME]:element[VIDEO_PAGE_NAME],
            [IS_OLD_VIDEO]:args[VIDEO_DATA][IS_OLD_VIDEO],
            [VIDEO_URL]:element[VIDEO_URL],
            [AUDIO_URL]:element[AUDIO_URL],
        }
        downloadList.push(task)
    });
})