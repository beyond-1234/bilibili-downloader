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
  MERGE_FINISHED,
  START_MERGE,
  VIDEO_PATH,
  AUDIO_PATH,
  OUTPUT,
  INDEX
} from "../../constants";
import * as downloadEngine from "../../util/downloadEngine";

export default {
  name: "merge",
  props: [],
  data() {
    return {};
  },
  mounted() {
    ipcRenderer.on(START_MERGE, (event, args) => {
      console.log("merge")
      downloadEngine
        .mergeFiles(args[VIDEO_PATH], args[AUDIO_PATH], args[OUTPUT])
        .then(() => {
          ipcRenderer.sendTo(event.senderId, MERGE_FINISHED, {
            [INDEX]: args[INDEX],
            [TASK_ID]: args[TASK_ID]
          });
        })
        .catch(error => {
          console.log(error)
          ipcRenderer.sendTo(event.senderId, MERGE_FAILED, {
            [INDEX]: args[INDEX],
            [TASK_ID]: args[TASK_ID],
            [ERROR]: error
          });
        });
    });
  }
};
</script>

