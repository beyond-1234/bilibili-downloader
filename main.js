// Modules to control application life and create native browser window
const { app, ipcMain } = require('electron')
const mainWindow = require('./mainWindow')
const mergeWindow = require('./mergeWindow')
var downloadEngine = require('./util/downloadEngine')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    // mergeWindow.createWindow()

    mainWindow.createWindow()

})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()

})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) minWindow.createWindow()
    // if (mergeWindow == null) mergeWindow.createWindow()
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// view send start a download task msg
// if there's a task ongoing, do nothing
// else start download required task


ipcMain.on("startDownload", async (event, args) => {
    if (downloadEngine.isAvailable()) {
        console.log("engine available, start task")
        downloadEngine.occupy()

        var videoTotal = 0
        var audioTotal = 0
        var videoReceived = 0
        var audioReceived = 0
        var isOldVideo = args["isOldVideo"]
        console.log("download start")
        // download video and audio separately
        await downloadEngine.startDownload(args,
            (type, received, total) => {
                if (type === "videoProgress") {
                    videoTotal = total
                    videoReceived = received
                } else {
                    audioTotal = total
                    audioReceived = received
                }
                event.reply("updateProgress", {
                    "id": args["id"],
                    "videoTotal": videoTotal,
                    "audioTotal": audioTotal,
                    "videoReceived": videoReceived,
                    'audioReceived': audioReceived,
                    "isOldVideo": isOldVideo
                })
            }
        ).then(() => {
            if (videoTotal == videoReceived && audioTotal == audioReceived && !isOldVideo) {
                console.log("create merge window")

                mergeWindow.createWindow()

                console.log("merge start")

                // send to merge process to merge video and audio
                event.reply("mergeFiles", {
                    "id": args["id"],
                    "rootPath": args["rootPath"],
                    "avNumber": args["avNumber"],
                    "part": args["part"]
                })
            }

            if (isOldVideo) {
                event.reply("taskComplete", {
                    "id": args["id"]
                })
            }

        })
            .catch((error) => {
                // downloadEngine.deleteDirectory(args["rootPath"] + "/" + args["avNumber"])
                console.log("send download error msg to renderer")
                // console.log(JSON.stringify(error))
                event.reply("downloadFailed", {
                    "id": args["id"],
                    "error": error
                })
            })

    } else {
        console.log("download engine occupied")
        event.reply("wait", { "id": args["id"] })
    }
    downloadEngine.free()
})

// stop merge
ipcMain.on("closeMergeWin", (event, args) => {
    mergeWindow.closeWindow()
})

// stop task
ipcMain.on("cancel", (event, args) => {
    downloadEngine.cancel()
})

// ipcMain.on("startDownload", async (event, args) => {
//   if (downloadEngine.isAvailable()) {
//     console.log("engine available, start task")
//     downloadEngine.occupy()

//     var videoProgress = 0
//     var audioProgress = 0

//     console.log("download start")
//     // download video and audio separately
//     await downloadEngine.startDownload(args,
//       (type, progress) => {
//         if (type === "videoProgress") {
//           videoProgress = progress
//         } else {
//           audioProgress = progress
//         }
//         event.reply("udpateProgress", {
//           "id": args["id"],
//           "part": args["part"],
//           "videoProgress": videoProgress,
//           "audioProgress": audioProgress
//         })
//       }
//     ).then(() => {
//       if (videoProgress == 100 && audioProgress == 100) {
//         console.log("merge start")
//         event.reply("mergeFiles", {
//           "id": args["id"],
//           "part": args["part"]
//         })
//         // merge video and audio
//         downloadEngine.mergeFiles(args["rootPath"], args["avNumber"], args["part"])
//           .then(() => {
//             console.log("merge complete")
//             event.reply("taskComplete", {
//               "id": args["id"],
//               "part": args["part"]
//             })
//           })
//           .catch((error) => {
//             // downloadEngine.deleteDirectory(args["rootPath"] + "/" + args["avNumber"])
//             event.reply("mergeFailed", {
//               "id": args["id"],
//               "part": args["part"],
//               "error": error
//             })
//           })
//       }

//     })
//       .catch((error) => {
//         // downloadEngine.deleteDirectory(args["rootPath"] + "/" + args["avNumber"])
//         event.reply("downloadFailed", {
//           "id": args["id"],
//           "part": args["part"],
//           "error": error
//         })
//       })

//   }
// })


// ipcMain.on("startDownload", async (event, args) => {

//   console.log("startDownload channel, main received")

//   if (downloadEngine.isAvailable()) {
//     console.log("engine available, start task")
//     downloadEngine.occupy()

//     console.log("download start")

//     await downloadEngine.startDownload(args, (videoProgress, audioProgress) => {
//       mainProcess.reply("udpateProgress", {
//         "id": args["id"],
//         "part": args["part"],
//         "videoProgress": videoProgress,
//         "audioProgress": audioProgress
//       })
//     })
//       .then(async () => {

//         console.log("merge start")

//         // download completed, tell renderer process and start merging file
//         event.reply("mergeFiles", {
//           "id": args["id"],
//           "part": args["part"]
//         })
//         await downloadEngine.mergeFile(args["rootPath"], args["avNumber"], args["part"])
//           .then(() => {
//             console.log("merge complete")
//             event.reply("taskComplete", {
//               "id": args["id"],
//               "part": args["part"]
//             })
//             // merge file error
//           }).catch((error) => {
//             console.log("merge failed")
//             event.reply("mergeFailed", {
//               "id": args["id"],
//               "part": args["part"],
//               "error": error
//             })
//           })
//         // download error
//       }).catch((error) => {
//         console.log("download failed")
//         event.reply("downloadFailed", {
//           "id": args["id"],
//           "part": args["part"],
//           "error": error
//         })
//       })

//   } else {
//     console.log("engine not available")
//   }
// })





// // get basic video info
// ipcMain.on("getVideoBasicInfo", async (event, args) => {
//   var referer = "https://www.bilibili.com/video/" + args["avNumber"]
//   var videoData = await videoUtil.getInfo(referer)
//   // console.log(videoData)
//   event.reply("getVideoBasicInfo", { "videoData": videoData })
// })

// // get video url and start download
// // update cookies
// ipcMain.on("downloadVideo", async (event, args) => {
//   var referer = "https://www.bilibili.com/video/" + args["avNumber"]
//   var videoUrls = {
//     "avNumber": args["avNumber"],
//     "acceptCode": args["acceptCode"],
//     "urls": []
//   }
//   for (let index = 0; index < args["parts"].length; index++) {
//     var url = await videoUtil.getUrl(referer, args["acceptCode"], args["parts"])
//     if (url["hasError"]) {
//       event.reply("downloadVideo", {
//         "status": false,
//         "error": url["error"]
//       })
//       console.log("get url failed")
//       return
//     }
//     videoUrls["urls"].push(url)
//   }

//   console.log("main process reply")
//   event.reply("downloadVideo", { "status": true })

//   //store info in cookies and start download
//   for (let index = 0; index < args["parts"].length; index++) {
//     console.log("start get video urls")
//     const p = args["parts"][index];
//     var url = {
//       "video": videoUrls["urls"][index]["video"],
//       "audio": videoUrls["urls"][index]["audio"],
//       "total": 0,
//       "received": 0,
//       "started": false,
//       "finished": false
//     }

//   }
// })

//     //cookie persistence does not work
//     //ipcMain send msg to ipcRenderer, and store data in localStorage

