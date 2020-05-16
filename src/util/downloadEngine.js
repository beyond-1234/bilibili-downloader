var fs = require('fs')
var axios = require('axios')
axios.defaults.adapter = require('axios/lib/adapters/http');
var staticFFmpeg = require('ffmpeg-static-electron')
var ffmpeg = require('fluent-ffmpeg')
const path = require('path')
import {
    ROOT_PATH, NUMBER,
    AUDIO_RECEIVED,
    VIDEO_RECEIVED,
    VIDEO_PAGE,
    IS_OLD_VIDEO,
    VIDEO_PROGRESS,
    AUDIO_PROGRESS,
    AUDIO_URL,
    VIDEO_URL,
    ACCEPT_NAME,
    VIDEO_PATH,
    AUDIO_PATH,
    OUTPUT,
    AUDIO_TOTAL,
    VIDEO_TOTAL,
    FOLDER,
    TIMEOUT
} from '../constants'

// used to cancel downloading
var CancelToken = axios.CancelToken;
var cancelSource = CancelToken.source();
var ffmpegCommand


/**
 * download video and audio
 * info renderer process to update progress
 */
export async function startDownload(downloadInfo, callback) {

    var rootPath = downloadInfo[ROOT_PATH]
    var acceptName = downloadInfo[ACCEPT_NAME]
    var avNumber = downloadInfo[NUMBER]
    var audioReceived = downloadInfo[AUDIO_RECEIVED]
    var audioTotal = downloadInfo[AUDIO_TOTAL]
    var videoReceived = downloadInfo[VIDEO_RECEIVED]
    var videoTotal = downloadInfo[VIDEO_TOTAL]
    var part = downloadInfo[VIDEO_PAGE]
    var isOldVideo = downloadInfo[IS_OLD_VIDEO]
    var videoUrl = downloadInfo[VIDEO_URL]
    var audioUrl = downloadInfo[AUDIO_URL]
    var folder = downloadInfo[FOLDER]
    var videoPath = downloadInfo[IS_OLD_VIDEO] ? downloadInfo[OUTPUT] : downloadInfo[VIDEO_PATH]
    var audioPath = downloadInfo[AUDIO_PATH]
    var output = downloadInfo[OUTPUT]

    return new Promise((resolve, reject) => {

        // stat method return a Stats object
        // size property in Stats object is bigInt type
        // BigInt 和 Number 不是严格相等的，但是宽松相等的。 so use ==
        console.log("check existing files")
        syncDownloadProgress(folder, videoPath, audioPath,
            () => {
                try {
                    fs.mkdirSync(folder)
                } catch (error) {
                    reject(error)
                }
            },
            (videoOnDisk) => {
                videoReceived = videoOnDisk
            },
            (audioOnDisk) => {
                audioReceived = audioOnDisk
            })

        console.log("start download")
        // get video total
        downloadVideo(videoUrl, avNumber, part, videoReceived, videoPath, callback)
            .then(() => {
                // video downloaded
                // get audio total
                downloadAudio(audioUrl, avNumber, part, isOldVideo, audioReceived, audioPath, callback)
                    .then(() => {
                        resolve()
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
            .catch(error => {
                reject(error)
            })
    })

}

function downloadAudio(audioUrl, avNumber, part, isOldVideo, audioReceived, audioPath, callback) {
    return new Promise((resolve, reject) => {

        getTotalSize(audioUrl, avNumber, part)
            .then((total_bytes) => {
                // old video does not split video and audio
                if (!isOldVideo && audioReceived < total_bytes) {

                    // download audio
                    doDownloadAudio(audioReceived, audioUrl, avNumber, part, audioPath, callback)
                        .then(() => {
                            // download finished
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                } else {
                    // if no need to download, update task progress
                    callback(AUDIO_PROGRESS, audioReceived, total_bytes);
                    resolve()
                }
            })
            .catch((error) => {
                reject(error);
            });
    })
}

function doDownloadAudio(audioReceived, audioUrl, avNumber, part, audioPath, callback) {
    return new Promise((resolve, reject) => {

        console.log("download audio");
        doDownload(audioUrl, avNumber, part, audioPath, audioReceived,
            async (received_bytes, total_bytes) => {
                callback(AUDIO_PROGRESS, received_bytes, total_bytes);
            }
        )
            .then(() => {
                console.log("audio end");
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    })
}

function downloadVideo(videoUrl, avNumber, part, videoReceived, videoPath, callback) {
    return new Promise((resolve, reject) => {
        getTotalSize(videoUrl, avNumber, part)
            .then((total_bytes) => {
                // do not swap order
                if (videoReceived < total_bytes) {
                    // download video
                    doDownloadVieo(videoReceived, videoUrl, avNumber, part, videoPath, callback)
                        .then(() => {
                            resolve()
                        })
                        .catch((error) => {
                            reject(error);
                        });
                } else {
                    // if no need to download, update task progress
                    callback(VIDEO_PROGRESS, videoReceived, total_bytes);
                    resolve()
                }
            })
            .catch((error) => {
                reject(error);
            });
    })

}

function doDownloadVieo(videoReceived, videoUrl, avNumber, part, videoPath, callback) {
    return new Promise((resolve, reject) => {

        doDownload(videoUrl, avNumber, part, videoPath, videoReceived,
            async (received_bytes, total_bytes) => {
                callback(VIDEO_PROGRESS, received_bytes, total_bytes);
            }
        )
            .then(() => {
                console.log("video end");
                resolve()
            })
            .catch((error) => {
                reject(error);
            });

    })
}

export function mergeFiles(videoPath, audioPath, output) {
    console.log("merging file")
    // delete temp file if exists
    if (fs.existsSync(output)) { fs.unlinkSync(output) }

    //stimulate
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 5000)
    })

    // start merge files
    // return new Promise((resolve, reject) => {


    //     console.log(staticFFmpeg.path)
    //     ffmpegCommand = ffmpeg.setFfmpegPath(staticFFmpeg.path.replace("asar", "asar.unpacked"))
    //     ffmpeg()
    //         .addInput(videoPath)
    //         .addInput(audioPath)
    //         .save(output)
    //         .on("end", () => {
    //             console.log("complete")

    //             // this.deleteDirectory(rootPath + "/" + avNumber)
    //             if (fs.existsSync(videoPath)) { fs.unlink(videoPath) }
    //             if (fs.existsSync(audioPath)) { fs.unlink(audioPath) }
    //             console.log("temp file deleted")
    //             resolve()
    //         })
    //         .on("error", (error) => {
    //             // console.log(error)
    //             reject(error)
    //         })
    // })

}

// merge audio and video files
// exports.mergeFiles = (rootPath, avNumber, part) => {
// export function mergeFiles(rootPath, avNumber, part) {
//     var path = rootPath + "/" + avNumber + 'Part' + part + ".flv"
//     var videoPath = rootPath + "/" + avNumber + '/' + part + "-v.m4s"
//     var audioPath = rootPath + "/" + avNumber + '/' + part + "-a.m4s"
//     console.log("merging file")
//     // delete temp file if exists
//     if (fs.existsSync(path)) { fs.unlinkSync(path) }
//     // start merge files
//     return new Promise((resolve, reject) => {
//         ffmpegCommand = ffmpeg.setFfmpegPath(staticFFmpeg.path)
//         ffmpeg()
//             .addInput(videoPath)
//             .addInput(audioPath)
//             .save(path)
//             .on("end", () => {
//                 console.log("complete")

//                 this.deleteDirectory(rootPath + "/" + avNumber)
//                 // fs.unlink(videoPath)
//                 // fs.unlink(audioPath)
//                 console.log("temp file deleted")
//                 resolve()
//             })
//             .on("error", (error) => {
//                 // console.log(error)
//                 reject(error)
//             })
//     })
// }

// // stop merging file (uesless)

export function stopMergingFiles() {
    console.log("stop merging")
    if (ffmpegCommand != null) {
        ffmpegCommand.kill("SIGSTOP")
    }
}

function syncDownloadProgress(folder, videoPath, audioPath, folderCallback, videoCallback, audioCallback) {

    if (!fs.existsSync(folder)) {
        folderCallback()
        videoCallback(0)
        audioCallback(0)
        return
    }

    if (fs.existsSync(videoPath)) {
        videoCallback(fs.statSync(videoPath)["size"])
    } else {
        videoCallback(0)
    }

    if (fs.existsSync(audioPath)) {
        audioCallback(fs.statSync(audioPath)["size"])
    } else {
        audioCallback(0)
    }

}

export function getTotalSize(url, avNumber, part) {
    var authority = url.substring(8, url.indexOf("/", 8))
    var referer = "https://www.bilibili.com/video/" + avNumber + "?p=" + part
    // console.log(authority)
    // console.log(referer)
    // console.log(url)

    return new Promise((resolve, reject) => {
        axios({
            method: "GET",
            url: url,
            // responseType: "stream",
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
                "Range": "0-1"
            },
            // timeout: TIMEOUT,
            cancelToken: cancelSource.token
        }).then(async (response) => {
            var total_bytes = response.headers['content-length']
            console.log(total_bytes)
            resolve(total_bytes)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// download file
function doDownload(url, avNumber, part, path, received, callback) {

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
            // timeout: TIMEOUT,
            cancelToken: cancelSource.token
        }).then(async (response) => {
            console.log("response")
            var total_bytes = response.headers['content-length']
            var received_bytes = received
            const writer = fs.createWriteStream(path, { flags: 'a' })

            response.data.on('data', async (chunk) => {
                received_bytes += chunk.length
                console.log(received_bytes)
                callback(received_bytes, total_bytes)
            })
            response.data.pipe(writer)
            response.data.on('end', () => {
                resolve()
            })
        })
            .catch((error) => {
                reject(error)
            })
    })

}

export function deleteDirectory(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                this.deleteDirectory(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }

}

// cancel axios downloading
export function cancel() {
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