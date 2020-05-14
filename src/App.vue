<template>
  <div>
    <aside class="tabs is-centered">
      <ul>
        <li id="add-btn" v-bind:class="{'is-active':currentTab == 0}" v-on:click="currentTab = 0">
          <a>Home</a>
        </li>
        <li id="downloading-btn" v-bind:class="{'is-active':currentTab == 1}" v-on:click="currentTab = 1">
          <a>Downloading</a>
        </li>
        <li id="finished-btn" v-bind:class="{'is-active':currentTab == 2}" v-on:click="currentTab = 2">
          <a>Finished</a>
        </li>
        <li id="failed-btn" v-bind:class="{'is-active':currentTab == 3}" v-on:click="currentTab = 3">
          <a>Failed</a>
        </li>
      </ul>
    </aside>

    <div>
      <home v-bind:class="{ 'hide': currentTab != 0}"></home>

      <downloadList v-bind:class="{ 'hide': currentTab != 1}" ></downloadList>

      <finishedList v-bind:class="{ 'hide': currentTab != 2}" ></finishedList>
      
      <failedList   v-bind:class="{ 'hide': currentTab != 3}" ></failedList>

      <!-- for merge windows, no html contents -->
      <merge></merge>
    </div>
  </div>
</template>

<script>
import home from "./components/home/home.vue"
import downloadList from "./components/list/downloadList.vue"
import failedList from "./components/list/failedList.vue"
import finishedList from "./components/list/finishedList.vue"
import merge from "./components/task/merge.vue"
import store from "./util/store"
import { ipcRenderer } from 'electron'
import { CHANGE_TAB } from './constants'
// import detail from "./components/detail/detail.vue";

export default {
  name: "App",
  components: {
    home,
    downloadList,
    failedList,
    finishedList,
    merge
  },
  mounted(){
    ipcRenderer.on(CHANGE_TAB, (event, args) => {
      this.currentTab = args.cur
    })
  },
  data() {
    return {
      currentTab:0,
      rootPath: "",
      searchHistory: [],
      downloadList:[],
      finishedList:[],
      failedList:[]
    };
  }
};
</script>

<style>
.hide {
  /* use !important to forcely overwrite this property */
  display: none !important;
}
</style>
