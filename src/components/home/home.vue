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
					<div
						id="radio-parent"
						class="control"
						style="margin-bottom: 10px !important;"
						v-for="item in videoData['accept']"
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
								{{p.partName}}
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
									<li v-for="item of searchHistory" :key="item">{{ item }}</li>
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
import { getInfo, getUrl } from "../../util/videoUtil.js";
import { ipcRenderer } from "electron";
// import { clone, getEmptyVideoData } from '../../util/util';

const constants = require("../../constants");

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
				id: "",
				number: "",
				title: "",
				desc: "",
				accept: [],
				isOldVideo: false,
				upName: "",
				pageCount: 0,
				pages: [],
				urls: [],
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

			this.videoData = await getInfo(searchNumber[0]);

			// console.log(this.videoData);

			if (this.videoData["hasError"]) {
				console.log(this.videoData["error"]);
				return;
			}

			this.showDetail = true;
			this.updateHistory();
		},
		updateHistory() {
			// this.searchHistory.push(this.searchInput)
			this.searchHistory.splice(0, 0, this.searchInput);
			if (this.searchHistory.length == 101) {
				this.searchHistory.pop();
			}
			localStorage.setItem("searchHistory", this.searchHistory);
		},
		doGetVideoData() {
			var acceptCode = -1;
			var urls = [];

			this.videoData["accept"].forEach(item => {
				if (item["select"]) acceptCode = item["acceptCode"];
			});

			if (acceptCode == -1) return;

			this.videoData["pages"].forEach(item => {
				if (item["select"]) {
					getUrl(
						this.videoData.number,
						acceptCode,
						item["page"],
						this.videoData["isOldVideo"]
					)
						.then(url => {
							urls.push(url);
						})
						.catch(error => {
							console.log(error);
						});
				}
			});

			this.videoData["urls"] = urls;
		},
		startDownload() {
			this.downloadButtonDisabled = true;

			if (this.videoData["urls"].length == 0) {
				this.doGetVideoData();
			}

			// var data = clone(this.videoData)
			this.videoData["id"] = new Date().getTime().toString();
			// console.log(data)
			// ipc send will pass args by value not by ref
			ipcRenderer.send(constants.startDownload, this.videoData);

			this.downloadButtonDisabled = false;
		},
		cancel() {
			this.showDetail = false;
			// this.videoData = getEmptyVideoData()
		}
	}
};
</script>
