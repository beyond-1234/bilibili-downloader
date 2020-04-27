var fs = require('fs')
var axios = require('axios')
var ffmpeg = require('fluent-ffmpeg')
var staticFFmpeg = require('ffmpeg-static-electron')

// used to cancel downloading
var CancelToken = axios.CancelToken;
var cancelSource = CancelToken.source();

var using = false

exports.isAvailable = () => {
    return !using
}

exports.occupy = () => {
    using = true
}

exports.free = () => {
    using = false
}

// download video and audio
// info renderer process to update progress
exports.startDownload = async (downloadInfo, callback) => {

    // console.log("start download" + JSON.stringify(downloadInfo))

    var rootPath = downloadInfo["rootPath"]
    var avNumber = downloadInfo["avNumber"]
    var audioReceived = downloadInfo["audioReceived"]
    var videoReceived = downloadInfo["videoReceived"]
    var part = downloadInfo["part"]
    var isOldVideo = downloadInfo["isOldVideo"]
    var videoPath = ""
    var audioPath = ""
    if (!isOldVideo) {
        videoPath = rootPath + "/" + avNumber + "/" + part + "-v.m4s"
        audioPath = rootPath + "/" + avNumber + "/" + part + "-a.m4s"
    } else {
        videoPath = rootPath + "/" + avNumber + "-" + part + ".flv"
    }

    return new Promise(async (resolve, reject) => {

        // stat method return a Stats object
        // size property in Stats object is bigInt type
        // BigInt 和 Number 不是严格相等的，但是宽松相等的。 so use ==
        console.log("check existing files")

        if (fs.existsSync(rootPath + '/' + avNumber)) {
            if (fs.existsSync(videoPath)) {
                if (!(videoReceived == fs.statSync(videoPath)["size"])) {
                    fs.unlinkSync(videoPath)
                    videoReceived = 0
                }
            }

            if (fs.existsSync(audioPath)) {
                if (!(audioReceived == fs.statSync(audioPath)["size"])) {
                    fs.unlinkSync(audioPath)
                    audioReceived = 0
                }
            }
        } else {
            fs.mkdirSync(rootPath + '/' + avNumber)
            videoReceived = 0
            audioReceived = 0
        }

        var videoFinished = false
        var audioFinished = false
        console.log("download video")

        await download(downloadInfo["videoUrl"], avNumber, part, videoPath, videoReceived,
            async (received_bytes, total_bytes) => {
                // var progress = Math.round(received_bytes / total_bytes * 100)
                callback("videoProgress", received_bytes, total_bytes)
            })
            .then(async () => {
                videoFinished = true
            })
            .catch((error) => {
                reject(error)
            })

        // old video does not split video and audio
        if (!isOldVideo) {
            console.log("download audio")
            await download(downloadInfo["audioUrl"], avNumber, part, audioPath, audioReceived,
                async (received_bytes, total_bytes) => {
                    // var progress = Math.round(received_bytes / total_bytes * 100)
                    callback("audioProgress", received_bytes, total_bytes)
                })
                .then(async () => {
                    audioFinished = true
                })
                .catch((error) => {
                    reject(error)
                })

            if (videoFinished && audioFinished) {
                resolve()
            }
        }
    })

}

// merge audio and video files
exports.mergeFiles = (rootPath, avNumber, part) => {

    var path = rootPath + "/" + avNumber + 'Part' + part + ".flv"
    var videoPath = rootPath + "/" + avNumber + '/' + part + "-v.m4s"
    var audioPath = rootPath + "/" + avNumber + '/' + part + "-a.m4s"
    console.log("merging file")
    // delete temp file if exists
    if (fs.existsSync(path)) { fs.unlinkSync(path) }
    // start merge files
    return new Promise((resolve, reject) => {
        ffmpegCommand = ffmpeg.setFfmpegPath(staticFFmpeg.path)
        ffmpeg()
            .addInput(videoPath)
            .addInput(audioPath)
            .save(path)
            .on("end", () => {
                console.log("complete")

                this.deleteDirectory(rootPath + "/" + avNumber)
                console.log("temp file deleted")
                resolve()
            })
            .on("error", (error) => {
                // console.log(error)
                reject(error)
            })
    })
}

// // stop merging file (uesless)
exports.stopMergingFiles = () => {
    console.log("stop merging")
    if (ffmpegCommand != null) {
        ffmpegCommand.kill("SIGSTOP")
    }
}

// download file
function download(url, avNumber, part, path, received, callback) {

    var authority = url.substring(8, url.indexOf("/", 8))
    var referer = "https://www.bilibili.com/video/" + avNumber + "?p=" + part
    // console.log(authority)
    // console.log(referer)
    // console.log(url)

    return new Promise((resolve, reject) => {
        axios({
            method: "GET",
            url: url,
            responseType: "stream",
            headers: {
                "Host": authority,
                "Connection": "keep-alive",
                "Cache-Control": "no-cache",
                "Origin": "https://www.bilibili.com",
                "Accept": "*/*",
                "Sec-Fetch-Site": "cross-site",
                "Sec-Fetch-Mode": "cors",
                "Referer": referer,
                "Accept-Encoding": "identity",
                "Accept-Language": "zh-CN,zh;q=0.9",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKet/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36",
                "Range": `${received}-`
            },
            cancelToken: cancelSource.token
        }).then(async (response) => {
            // console.log(JSON.stringify(response["data"]))
            var total_bytes = response.headers['content-length']
            var received_bytes = received
            const writer = fs.createWriteStream(path, { flags: 'a' })

            response.data.on('data', async (chunk) => {
                received_bytes += chunk.length
                await callback(received_bytes, total_bytes)
            })
            response.data.pipe(writer)
            response.data.on('end', () => {
                console.log("download finished")
                resolve()
            })
        })
            .catch((error) => {
                // console.log(error)
                reject(error)
            })
    })

}

exports.deleteDirectory = (path) => {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteDirectory(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }

}

exports.cancel = () => {
    console.log("cancel")
    cancelSource.cancel('cancel');
    // renew cancel token, so that other request will not be cancelled automatically
    CancelToken = axios.CancelToken;
    cancelSource = CancelToken.source();
}

// return new Promise(async (resolve, reject) => {

//     var videoProgress = 0
//     var audioProgress = 0
//     var videoPath = downloadInfo["rootPath"] + "/" + downloadInfo["avNumber"] + "/" + downloadInfo["part"] + "-v.m4s"
//     var audioPath = downloadInfo["rootPath"] + "/" + downloadInfo["avNumber"] + "/" + downloadInfo["part"] + "-a.m4s"
//     var videoPromise = await download(downloadInfo["videoUrl"], downloadInfo["avNumber"], downloadInfo["part"])
//         .then(async (response) => {
//             console.log(JSON.stringify(response))

//             total_bytes = response.headers['content-length']
//             const writer = fs.createWriteStream(videoPath)

//             response.data.on('data', (chunk) => {
//                 received_bytes += chunk.length
//                 //id, part, videoProgress, audioProgress, mainProcess
//                 videoProgress = Math.round(received_bytes / total_bytes) * 100
//                 callback(videoProgress, audioProgress)
//                 console.log(received_bytes + "/" + total_bytes)
//             })
//             response.data.pipe(writer)
//         })
//         .catch((error) => {
//             console.log(JSON.stringify(error))
//             reject(error)
//         })

//     var audioPromise = await download(downloadInfo["audioUrl"], downloadInfo["avNumber"], downloadInfo["part"])
//         .then(async (response) => {

//             total_bytes = response.headers['content-length']
//             const writer = fs.createWriteStream(audioPath)

//             response.data.on('data', (chunk) => {
//                 received_bytes += chunk.length
//                 //id, part, videoProgress, audioProgress, mainProcess
//                 audioProgress = Math.round(received_bytes / total_bytes) * 100
//                 callback(videoProgress, audioProgress)
//                 console.log(received_bytes + "/" + total_bytes)
//             })
//             response.data.pipe(writer)
//         })
//         .catch((error) => {
//             console.log(JSON.stringify(error))
//             reject(error)
//         })

//     Promise.all(videoPromise, audioPromise).then(() => {
//         // download complete, wait 1s
//         setTimeout(resolve, 1000)
//     }).catch((error) => {
//         console.log(JSON.stringify(error))
//         reject(error)
//     })
// })