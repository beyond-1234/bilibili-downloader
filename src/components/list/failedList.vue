<template>
  <!-- download task list panel -->
  <div id="downloading">
    <div class="columns">
      <div
        id="downloadListContainer"
        class="column is-three-fifths is-offset-one-fifth"
        v-for="item in filteredList"
        :key="item.id"
      >
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
                      <font-awesome-icon icon="play" />
                    </a>
                  </span>
                  
                  <span :onclick="downloadDeleteItem(item.id)" class="icon">
                    <a>
                      <font-awesome-icon icon="ban" />
                    </a>
                  </span>
                  <p></p>
                  <!-- <span>video progress:{{Math.round(item.videoReceived / item.videoTotal * 100)}}</span>
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
                    class="label"
                    :class="{hide:item.videoReceived < item.videoTotal && item.audioReceived < item.audioTotal}"
                  >merging videio and audio, this can really take a while</label>-->
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
import {
  SHARED_OBJECT,
  ADD_TO_DOWNLOAD_LIST,
  TASK_WINDOW_ID,
  START_TASK_WINDOW,
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
  VIDEO_RECEIVED,
  VIDEO_TOTAL,
  AUDIO_RECEIVED,
  AUDIO_TOTAL,
  UPDATE_PROGRESS,
  DOWNLOAD_FAILED,
  INDEX,
  START_MERGE,
  MERGE_FINISHED,
  MERGE_FAILED,
  TASK_STATUS,
  STOPPED_STATUS,
  VIDEO_PATH,
  AUDIO_PATH,
  OUTPUT,
  DOWNLOAD_LIST,
  FINISHED_LIST,
  FAILED_LIST,
  RESUME_TASK,
  DELETE_TASK
} from "../../constants";
import store from "../../util/store";

export default {
  name: "failedList",
  props: ["listType"],
  data() {
    // do not use data function, because i want to share the whole list in finished and failed list
    return { 
      sharedList: store.state.list, 
      taskWinList: [] 
    };
  },
  computed: {
    filteredList: function() {
      return this.sharedList.filter(item => {
            return (
              item[TASK_STATUS] != STOPPED_STATUS && item[HAS_ERROR] == true
            );
          });
    }
  },
  methods: {
    downloadStartItem(id) {
      ipcRenderer.send(RESUME_TASK, {
        [TASK_ID]: id
      });
    },
    downloadDeleteItem(id) {
      // store.getByID(id)[TASK_STATUS] = DELETED_STATUS
      ipcRenderer.send(DELETE_TASK, {
        [TASK_ID]: id
      });
    },
    getItem (index){
      return store.get(index)
    },
    addItem(item){
      store.add(item)
    }
  }
};
</script>