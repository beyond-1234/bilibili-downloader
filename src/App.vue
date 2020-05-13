<template>
  <div>
    <aside class="tabs is-centered">
      <ul>
        <li id="add-btn" v-bind:class="{'is-active':cur == 0}" v-on:click="cur = 0">
          <a>Home</a>
        </li>
        <li id="downloading-btn" v-bind:class="{'is-active':cur == 1}" v-on:click="cur = 1">
          <a>Downloading</a>
        </li>
        <li id="finished-btn" v-bind:class="{'is-active':cur == 2}" v-on:click="cur = 2">
          <a>Finished</a>
        </li>
        <li id="failed-btn" v-bind:class="{'is-active':cur == 3}" v-on:click="cur = 3">
          <a>Failed</a>
        </li>
      </ul>
    </aside>

    <div>
      <home v-bind:class="{ 'hide': cur != 0}"></home>

      <downloadList v-bind:class="{ 'hide': cur != 1}" ></downloadList>

      <finishedList v-bind:class="{ 'hide': cur != 2}" ></finishedList>
      
      <failedList   v-bind:class="{ 'hide': cur != 3}" ></failedList>

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
  data() {
    return {
      cur: 0,
      rootPath: "",
      searchHistory: [],
      downloadList:[],
      finishedList:[],
      failedList:[]
    };
  },
  methods: {},
  created:function() {

    // if (localStorage.getItem("rootPath")) {
    //   this.rootPath = localStorage.getItem("rootPath");
    // } else {
    //   this.rootPath = require("electron").remote.app.getPath("downloads");
    // }

    // // get lists
    // for (var i = 0, len = localStorage.length; i < len; ++i) {
    //   // console.log(localStorage.getItem(localStorage.key(i)));
    //   var key = localStorage.key(i);
    //   if (key != null && key.match(/\d+/)) {
    //     var value = JSON.parse(localStorage.getItem(key));
    //     if (value["hasError"]) {
    //       this.failedList.push(value);
    //     } else if (value["finished"]) {
    //       this.finishedList.push(value);
    //     } else {
    //       this.downloadList.push(value);
    //     }
    //   }
    // }
  }
};
</script>

<style>
.hide {
  /* use !important to forcely overwrite this property */
  display: none !important;
}
</style>
