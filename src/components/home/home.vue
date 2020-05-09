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
						<p id="up-p" class="title is-6">{{videoData.upName}}</p>
					</div>

					<div class="field">
						<p class="subtitle is-5">Description:</p>
						<p id="desc-p" class="title is-6">{{videoData.desc}}</p>
					</div>

					<div class="field">
						<p class="subtitle is-5">Accept:</p>
					</div>
					<div
						id="radio-parent"
						class="control"
						style="margin-bottom: 10px !important;"
						v-for="item in videoData.accepts"
						:key="item.acceptCode"
					>
						<label :id="`label${item.acceptCode}`">
							<input
								:id="`radio112${item.acceptCode}`"
								type="radio"
								name="accept"
								:value="item.acceptCode"
								v-model="item.select"
							/>
							{{item.acceptName}}
						</label>
					</div>

					<div class="field">
						<p class="subtitle is-5" style="margin-bottom: 10px !important;">Part:</p>
						<div id="part-div" v-for="p in videoData.pages" :key="p.page">
							<label :id="`label${p.page}`" class="checkbox">
								<input type="checkbox" :id="`check${p.page}`" v-model="p.select" />
								{{p.pageName}}
							</label>
							<p></p>
						</div>
					</div>
					<!-- <input id="input-isOldVideo" type="hidden" name="input-isOldVideo" value="0" /> -->
				</section>
				<footer class="modal-card-foot">
					<button
						id="get-video-btn"
						class="button is-success"
						@click="startDownload"
						:disabled="downloadButtonDisabled"
					>Go</button>
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
							<input id="path-input" class="input" type="text" v-model="rootPath" />
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
								<ul id="history-ul">
									<li v-for="item of searchHistory" :key="item.id">{{ item.input }}</li>
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
import * as videoUtil from "../../util/videoUtil.js";
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
	TASK_ID
} from "../../constants";

export default {
	name: "home",
	data() {
		return {
			downloadButtonDisabled: false,
			modal: "modal",
			searchInput: "",
			showDetail: false,
			rootPath: "",
			searchHistory: [],
			videoData: {
				[NUMBER]: "",
				[TITLE]: "",
				[DESC]: "",
				[ACCEPTS]: [],
				[IS_OLD_VIDEO]: false,
				[UP_NAME]: "",
				[PAGE_COUNT]: 0,
				[VIDEO_PAGES]: [],
				[URLS]: [],
				[HAS_ERROR]: false,
				[ERROR]: {}
			}
		};
	},
	props: [],
	mounted() {
		// get rootpath
		if (localStorage.getItem(ROOT_PATH)) {
			this.rootPath = localStorage.getItem(ROOT_PATH);
		} else {
			this.rootPath = require("electron").remote.app.getPath("downloads");
		}

		// get search history
		if (localStorage.getItem(SEARCH_HISTORY)) {
			this.searchHistory = JSON.parse(localStorage.getItem("searchHistory"))
			// this.searchHistory = localStorage.getItem(SEARCH_HISTORY).split(",");
		}
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
						localStorage.setItem(ROOT_PATH, this.rootPath);
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

			// console.log(this.videoData);

			if (this.videoData[HAS_ERROR]) {
				console.log(this.videoData[ERROR]);
				return;
			}

			this.showDetail = true;
			this.updateHistory();
		},
		updateHistory() {
			// this.searchHistory.push(this.searchInput)
			this.searchHistory.splice(0, 0, {
				id:new Date().getTime().toString(),
				input:this.searchInput
			});
			if (this.searchHistory.length == 101) {
				this.searchHistory.pop();
			}
			localStorage.setItem(SEARCH_HISTORY, JSON.stringify(this.searchHistory));
		},
		startDownload() {
			this.downloadButtonDisabled = true;

			this.doGetVideoData()
				.then(() => {
					this.doSendToTaskWin();
				})
				.catch(() => {
					return;
				});

			this.downloadButtonDisabled = false;
		},
		cancel() {
			this.showDetail = false;
			// this.videoData = getEmptyVideoData()
		},
		// argument urls is for a weird bug
		// for the first time to start download, you can not tansfer urls inside videoData
		// i really don't know why.....
		doSendToTaskWin() {
			
			// ipc send will pass args by value not by ref
			ipcRenderer.send(ADD_TO_DOWNLOAD_LIST, {
				// [URLS]: ,
				[VIDEO_DATA]: this.videoData,
				[ROOT_PATH]: this.rootPath
			});
		},
		doGetVideoData() {
			var acceptCode = -1;
			// var urls = [];
			console.log("getting url");

			this.videoData[ACCEPTS].forEach(item => {
				if (item[SELECT] > 0) acceptCode = item[ACCEPT_CODE];
			});

			if (acceptCode == -1) return;

			return new Promise((resolve, reject) => {
				this.videoData[VIDEO_PAGES].forEach(item => {
					console.log("getting url inside");
					if (item[SELECT]) {
						videoUtil
							.getUrl(
								this.videoData.number,
								acceptCode,
								item[VIDEO_PAGE],
								this.videoData[IS_OLD_VIDEO]
							)
							.then(url => {
								console.log(url);
								this.videoData[URLS].push(url);
								resolve();
							})
							.catch(error => {
								this.videoData[HAS_ERROR] = true;
								this.videoData[ERROR] = error;
								console.log(error);
								reject();
							});
					}
				});
			});
			// urls.forEach(item => {
			// 	this.videoData[URLS].push(item);
			// })
		}
	}
};
</script>
