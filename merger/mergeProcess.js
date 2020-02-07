const ipcRenderer = require('electron').ipcRenderer
var downloadEngine = require('../util/downloadEngine')
const mainWinId = require('electron').remote.getGlobal('sharedObject').mainWindowId

ipcRenderer.on("mergeFiles", async (event, args) => {
    console.log("merge process order received")
    // merge video and audio
    downloadEngine.mergeFiles(args["rootPath"], args["avNumber"], args["part"])
        .then(() => {
            console.log("merge complete")
            ipcRenderer.sendTo(mainWinId, "taskComplete", {
                "id": args["id"]
            })
        })
        .catch((error) => {
            // downloadEngine.deleteDirectory(args["rootPath"] + "/" + args["avNumber"])
            ipcRenderer.sendTo(mainWinId, "mergeFailed", {
                "id": args["id"],
                "error": error
            })
        })
})

ipcRenderer.on("cancel", (event, args) => {
    console.log("merge process received stop msg")
    downloadEngine.stopMergingFiles()
    var window = require("electron").remote.getCurrentWindow()
    window.close()
})

    // if (downloadEngine.isAvailable()) {
    //     console.log("engine available, start task")
    //     downloadEngine.occupy()

    //     var videoProgress = 0
    //     var audioProgress = 0

    //     console.log("download start")
    //     // download video and audio separately
    //     await downloadEngine.startDownload(args,
    //         (type, progress) => {
    //             if (type === "videoProgress") {
    //                 videoProgress = progress
    //             } else {
    //                 audioProgress = progress
    //             }
    //             ipcRenderer.sendTo(mainWinId
    //                 , "udpateProgress", {
    //                 "id": args["id"],
    //                 "videoProgress": videoProgress,
    //                 "audioProgress": audioProgress
    //             })
    //         }
    //     ).then(() => {
    //         if (videoProgress == 100 && audioProgress == 100) {
    //             console.log("merge start")
    //             ipcRenderer.sendTo(mainWinId, "mergeFiles", {
    //                 "id": args["id"]
    //             })

    //         }

    //     })
    //         .catch((error) => {
    //             // downloadEngine.deleteDirectory(args["rootPath"] + "/" + args["avNumber"])
    //             console.log("send download error msg to renderer")
    //             ipcRenderer.sendTo(mainWinId, "downloadFailed", {
    //                 "id": args["id"],
    //                 "error": error
    //             })
    //         })

    // }