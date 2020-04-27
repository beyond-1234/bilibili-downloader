<template>
  <div>
    <!-- popup video info -->
    <div :class="{'is-active': showDetail, modal}">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Video Info</p>
          <button class="modal-close-btn delete" aria-label="close" @click="cancel"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <p class="subtitle is-5">av/bv Number:</p>
            <p id="avNumber-p" class="title is-6">{{videoData.number}}</p>
          </div>

          <div class="field">
            <p class="subtitle is-5">Title:</p>
            <p id="title-p" class="title is-6">{{videoData.title}}</p>
          </div>

          <div class="field">
            <p class="subtitle is-5">UP:</p>
            <p id="up-p" class="title is-6">{{videoData.up}}</p>
          </div>

          <div class="field">
            <p class="subtitle is-5">Description:</p>
            <p id="desc-p" class="title is-6">{{videoData.desc}}</p>
          </div>

          <div class="field">
            <p class="subtitle is-5">Accept:</p>
          </div>
          <div id="radio-parent" class="control" style="margin-bottom: 10px !important;">
            <label id="label112" :class="{hide:!hasAccept(112)}">
              <input
                id="radio112"
                type="radio"
                name="accept"
                value="112"
                :class="{hide:!hasAccept(112)}"
              />
              1080P+
            </label>
            <label id="label116" :class="{hide:!hasAccept(116)}">
              <input
                id="radio116"
                type="radio"
                name="accept"
                value="116"
                :class="{hide:!hasAccept(116)}"
              />
              1080P60
            </label>
            <label id="label74" :class="{hide:!hasAccept(74)}">
              <input
                id="radio74"
                type="radio"
                name="accept"
                value="74"
                :class="{hide:!hasAccept(74)}"
              />
              720P60
            </label>
            <label id="label80" :class="{hide:!hasAccept(80)}">
              <input
                id="radio80"
                type="radio"
                name="accept"
                value="80"
                :class="{hide:!hasAccept(80)}"
              />
              1080P
            </label>
            <label id="label64" :class="{hide:!hasAccept(64)}">
              <input
                id="radio64"
                type="radio"
                name="accept"
                value="64"
                :class="{hide:!hasAccept(64)}"
              />
              720P
            </label>
            <label id="label32" :class="{hide:!hasAccept(32)}">
              <input
                id="radio32"
                type="radio"
                name="accept"
                value="32"
                :class="{hide:!hasAccept(32)}"
              />
              480P
            </label>
            <label id="label16" :class="{hide:!hasAccept(16)}">
              <input
                id="radio16"
                type="radio"
                name="accept"
                value="16"
                :class="{hide:!hasAccept(16)}"
              />
              320P
            </label>
          </div>

          <div class="field">
            <p class="subtitle is-5" style="margin-bottom: 10px !important;">Part:</p>
            <div id="part-div" v-for="p in videoData.pages" :key="p.page">
              <label :id="`label${p.page}`" class="checkbox">
                <input type="checkbox" :id="`check${p.page}`" v-modal="p.page" />
                {{p.partName}}
              </label>
              <p></p>
            </div>
          </div>
          <!-- <input id="input-isOldVideo" type="hidden" name="input-isOldVideo" value="0" /> -->
        </section>
        <footer class="modal-card-foot">
          <button id="get-video-btn" class="button is-success" @click="startDownload">Go</button>
          <button class="modal-close-btn button" @click="cancel">Cancel</button>
        </footer>
      </div>
    </div>

    <!-- home panel -->
    <div id="add">
      <div class="columns">
        <div class="column is-three-fifths is-offset-one-fifth">
          <!-- set root path input -->
          <div class="field is-grouped">
            <p class="control is-expanded">
              <input
                id="path-input"
                class="input"
                type="text"
                v-model="rootPath"
              />
            </p>
            <p class="control">
              <button
                id="path-button"
                type="button"
                class="button is-primary"
                @click="setRootPath()"
              >Set Download Path</button>
            </p>
          </div>
          <!-- search input -->
          <div class="field">
            <div class="control is-large">
              <input
                id="avNumber-input"
                class="input is-large"
                type="text"
                placeholder="av/bv number"
                v-model="searchInput"
              />
            </div>
          </div>
          <!-- search button -->
          <div class="field column is-three-fifths is-offset-two-fifths">
            <div class="control">
              <button id="search-btn" type="button" class="button is-primary" @click="search">Search</button>
            </div>
          </div>

          <!-- histroy -->
          <div class="tile is-ancestor">
            <div class="tile is-parent">
              <div class="tile is-child box">
                <p class="title">History</p>
                <ul id="history-ul" v-for="item in searchHistory" :key="item">
                  {{ item }}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import videoUtil from "../../util/videoUtil.js";

export default {
  name: "home",
  data() {
    return {
      modal:"modal",
      searchInput: "",
      showDetail: false,
      rootPath: "",
      searchHistory: [],
      videoData: {
        number: "",
        title: "",
        desc: "",
        accept: {},
        isOldVideo: false,
        upName: "",
        pageCount: 0,
        pages: [],
        hasError: false,
        error: {}
      }
    };
  },
  props: [],
  mounted() {
    // get rootpath
    if (localStorage.getItem("rootPath")) {
      this.rootPath = localStorage.getItem("rootPath");
    } else {
      this.rootPath = require("electron").remote.app.getPath("downloads");
    }

    // get search history
    if (localStorage.getItem("searchHistory")) {
      // searchHistory = JSON.parse(localStorage.getItem("searchHistory"))
      this.searchHistory = localStorage.getItem("searchHistory").split(",");
    }
  },
  beforeDestroy(){
    // localStorage.setItem("searchHistory", this.searchHistory)
  },
  methods: {
    setRootPath() {
      require("electron")
        .remote.dialog.showOpenDialog({
          properties: ["openDirectory"]
        })
        .then(result => {
          if (result.filePaths.length == 1) {
            this.rootPath = result.filePaths[0];
            // store
            localStorage.setItem("rootPath", this.rootPath);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    async search() {
      var searchNumber = this.searchInput.trim().match(/[abB][vV].+/);

      if (searchNumber == null || searchNumber.length == 0) {
        return;
      }

      this.videoData = await videoUtil.getInfo(searchNumber[0]);
      console.log(this.videoData);

      if (this.videoData["hasError"]) {
        console.log(this.videoData["error"]);
        return;
      }

      this.showDetail = true;
      this.updateHistory()
    },
    updateHistory() {
      var searchNumber = this.searchInput.trim().match(/[abB][vV].+/);
      console.log("update history")
      if (searchNumber == null || searchNumber.length == 0) {
        return;
      }

      this.searchHistory.push(this.searchInput)
      localStorage.setItem("searchHistory", this.searchHistory)
    },
    hasAccept(acceptCode) {
      return this.videoData["accept"][acceptCode] != null ? true : false;
    },
    startDownload() {},
    cancel() {
      this.showDetail = false;
    }
  }
};
</script>
