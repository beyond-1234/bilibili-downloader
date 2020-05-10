<template>
  <!-- download task list panel -->
  <div id="downloading">
    <div class="columns">
      <div id="downloadListContainer" class="column is-three-fifths is-offset-one-fifth"
          v-for="item in list" :key="item.id">
        <!-- list -->

        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <div class="tile is-child box">
              <div class="field">
                <span class="title is-4">{{item.title}}</span>
                <span class="title is-4">{{item.nubmer}}</span>
                <div class="field">
                  <span class="title is-6">Part:{{item.pageName}}</span>
                  <span :onclick="downloadStartItem(item.id)" class="icon">
                    <a>
                      <i class="fa fa-play"></i>
                    </a>
                  </span>
                  <span :onclick="downloadPauseItem(item.id)" class="icon">
                    <a>
                      <i class="fa fa-pause"></i>
                    </a>
                  </span>
                  <span :onclick="downloadDeleteItem(item.id)" class="icon">
                    <a>
                      <i class="fa fa-ban"></i>
                    </a>
                  </span>
                  <p></p>
                  <span>video progress:{{Math.round(item.videoReceived / item.videoTotal * 100)}}</span>
                  <progress
                    class="progress is-primary is-small small-bottom-margin"
                    :value="Math.round(item.videoReceived / item.videoTotal * 100)"
                    max="100"
                  ></progress>
                  <span>audio progress:{{Math.round(item.audioReceived / item.audioTotal * 100)}}</span>
                  <progress
                    class="progress is-primary is-small small-bottom-margin"
                    :value="Math.round(item.audioReceived / item.audioTotal * 100)"
                    max="100"
                  ></progress>
                  <label
                    class="label" :class="{hide:item.videoReceived < item.videoTotal && item.audioReceived < item.audioTotal}"
                  >merging videio and audio, this can really take a while</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { ipcRenderer } from "electron";
import { SHARED_OBJECT, ADD_TO_DOWNLOAD_LIST, 
        TASK_WINDOW_ID, START_TASK_WINDOW,
        VIDEO_DATA,
        ROOT_PATH,
        SEARCH_HISTORY,
        VIDEO_PAGES,
        URLS,
        IS_OLD_VIDEO,
        VIDEO_PAGE,
        SELECT,
        ACCEPT_CODE,
        ACCEPTS,
        ERROR,
        HAS_ERROR,
        NUMBER,
        TITLE,
        DESC,
        UP_NAME,
        PAGE_COUNT,
        DOWNLOAD_FINISHED,
        TASK_ID, 
VIDEO_RECEIVED, VIDEO_TOTAL,AUDIO_RECEIVED,AUDIO_TOTAL,
        UPDATE_PROGRESS,DOWNLOAD_FAILED, INDEX, START_MERGE, MERGE_FINISHED, MERGE_FAILED, TASK_STATUS, STOPPED_STATUS, VIDEO_PATH, AUDIO_PATH, OUTPUT} from "../../constants";

export default {
  name: "downloadList",
  props: {},
  data() {
    return {
      list:[],
      taskWinList:[]
    };
  },
  mounted(){

    // when adding a task, main process would create download object.
    // add the object in the downloadList component
    ipcRenderer.on(ADD_TO_DOWNLOAD_LIST, (event, args) => {
      console.log("get downloading item")
      console.log(args)

      this.list.push(args)

    })
    ipcRenderer.on(DOWNLOAD_FINISHED, (event, args) => {
      console.log(this.list)
      console.log("download finished received")

      console.log(args[TASK_WINDOW_ID])

      setTimeout(()=>{
        ipcRenderer.sendTo(args[TASK_WINDOW_ID], START_MERGE, {
          [INDEX]:args[INDEX],
          [TASK_ID]:args[TASK_ID],
          [VIDEO_PATH]:this.list[args[INDEX]][VIDEO_PATH],
          [AUDIO_PATH]:this.list[args[INDEX]][AUDIO_PATH],
          [OUTPUT]:this.list[args[INDEX]][OUTPUT]
        })
      }, 2000)

    })
    ipcRenderer.on(DOWNLOAD_FAILED, (event, args) => {
      console.log(this.list)
    })
    ipcRenderer.on(UPDATE_PROGRESS, (event, args) => {
      // console.log(this.list[args[INDEX]])

      // try using index first
      // if not working well, try using taskId with binary search
      this.list[args[INDEX]][VIDEO_RECEIVED] = args[VIDEO_RECEIVED]
      this.list[args[INDEX]][VIDEO_TOTAL] = args[VIDEO_TOTAL]
      this.list[args[INDEX]][AUDIO_RECEIVED] = args[AUDIO_RECEIVED]
      this.list[args[INDEX]][AUDIO_TOTAL] = args[AUDIO_TOTAL]

    })
    ipcRenderer.on(MERGE_FINISHED, (event, args) => {
      this.list[args[INDEX]][TASK_STATUS] = STOPPED_STATUS
    })
    ipcRenderer.on(MERGE_FAILED, (event, args) => {
      this.list[args[INDEX]][HAS_ERROR] = true
      this.list[args[INDEX]][ERROR] = args[ERROR]
      this.list[args[INDEX]][TASK_STATUS] = STOPPED_STATUS
      
    })
    // ipcRenderer.on(START_TASK_WINDOW, (event, args) => {
    //   this.taskWinList.push({
    //     [TASK_ID]:
    //   })
    // })
  },
  methods:{
    downloadStartItem(id){

    },
    downloadPauseItem(id){

    },
    downloadDeleteItem(id){

    }
  }
};


</script>