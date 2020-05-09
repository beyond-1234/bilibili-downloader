<template>
  <!-- download task list panel -->
  <div id="downloading" class="hide">
    <div class="columns">
      <div id="downloadListContainer" class="column is-three-fifths is-offset-one-fifth">
        <!-- list -->

        <div id="1587900807964-download-div" class="tile is-ancestor">
          <div class="tile is-parent">
            <div class="tile is-child box">
              <div class="field">
                <span class="title is-4">av88792059-只有男人之间才有的默契</span>
                <div id="1587900807964-div" class="field">
                  <span class="title is-6">Part1-只有男人之间才有的默契</span>
                  <span onclick="downloadStartItem(1587900807964)" class="icon">
                    <a>
                      <i class="fa fa-play"></i>
                    </a>
                  </span>
                  <span onclick="downloadPauseItem(1587900807964)" class="icon">
                    <a>
                      <i class="fa fa-pause"></i>
                    </a>
                  </span>
                  <span onclick="downloadDeleteItem(1587900807964)" class="icon">
                    <a>
                      <i class="fa fa-ban"></i>
                    </a>
                  </span>
                  <p></p>
                  <span id="1587900807964-v-span">video progress:0</span>
                  <progress
                    id="1587900807964-v-progress"
                    class="progress is-primary is-small small-bottom-margin"
                    value="0"
                    max="100"
                  ></progress>
                  <span id="1587900807964-a-span">audio progress:0</span>
                  <progress
                    id="1587900807964-a-progress"
                    class="progress is-primary is-small small-bottom-margin"
                    value="0"
                    max="100"
                  ></progress>
                  <label
                    id="1587900807964-m-label"
                    class="label hide"
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
        UPDATE_PROGRESS,DOWNLOAD_FAILED} from "../../constants";

export default {
  name: "downloadList",
  props: {},
  data() {
    return {
      list:[]
    };
  },
  mounted(){

    ipcRenderer.on(ADD_TO_DOWNLOAD_LIST, (event, args) => {
      console.log("get downloading item")
      console.log(args)

      // this.downloadList.list.push(args)
      // console.log(exports)

    })
    ipcRenderer.on(DOWNLOAD_FINISHED, (event, args) => {
      console.log(this.list)
      console.log("download finished receive")
    })
    ipcRenderer.on(DOWNLOAD_FAILED, (event, args) => {
      console.log(this.list)
    })
    ipcRenderer.on(UPDATE_PROGRESS, (event, args) => {
      console.log(this.list)
    })
  }
};


</script>