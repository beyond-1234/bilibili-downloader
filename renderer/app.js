//renderer process must use require('electron).module
const ipcRenderer = require('electron').ipcRenderer
const videoUtil = require('../util/videoUtil')
$ = require('jquery')

var searchHistory = []
var downloadList = []
var finishedList = []
var failedList = []
var rootPath = ""

// listener update downloading progress
ipcRenderer.on("updateProgress", (event, args) => {
    updateProgress(args["id"], args["videoReceived"], args["audioReceived"], args["videoTotal"], args["audioTotal"], args["isOldVideo"])
})

// update downloading progress
function updateProgress(id, videoReceived, audioReceived, videoTotal, audioTotal, isOldVideo) {

    var downloadingPart = downloadList.find((info) => {
        return info["id"] === id
    })
    try {
        downloadingPart["start"] = true
        // if cancel downloading or maybe pause downloading will leads to error here
        // ipc messaging might be delayed so when pause or cancel, it still transfer msg, then error will occur
        downloadingPart["videoReceived"] = videoReceived
        if (videoTotal != 0) { downloadingPart["videoProgress"] = Math.round(videoReceived / videoTotal * 100) }
        $(`#${id}-v-span`).text(`video progress:${downloadingPart["videoProgress"]}`)
        $(`#${id}-v-progress`).attr("value", downloadingPart["videoProgress"])

        if (isOldVideo) {
            audioReceived = videoReceived
            audioTotal = videoTotal
        }

        downloadingPart["audioReceived"] = audioReceived
        if (audioTotal != 0) { downloadingPart["audioProgress"] = Math.round(audioReceived / audioTotal * 100) }
        $(`#${id}-a-span`).text(`audio progress:${downloadingPart["audioProgress"]}`)
        $(`#${id}-a-progress`).attr("value", downloadingPart["audioProgress"])
    } catch (error) {
        console.log(error)
    }
}

// download complete, start merging files
ipcRenderer.on("mergeFiles", (event, args) => {
    showMergingLabel(args["id"])
    setTimeout(() => {
        sendToMergeProcess("mergeFiles", args)
    }, 1000)
})

// download complete, start merging files
function showMergingLabel(id) {
    // var downloadItem = downloadList.find((info) => {
    //     return info["id"] == id
    // })
    $(`#${id}-m-label`).removeClass("hide")
}

// download task complete
ipcRenderer.on("taskComplete", (event, args) => {
    updateTaskCompleted(args["id"])
    sendToDownloadProcess("closeMergeWin", {})
})
// download task complete
function updateTaskCompleted(id) {
    var index = downloadList.find((info) => {
        return info["id"] == id
    })
    var item = downloadList.splice(index, 1)[0]
    item["finished"] = true
    $("#finished-btn").click()
    addFinishedItem(item)
    removeDownloadItem(id)
    finishedList.push(item)

    for (let index = downloadList.length - 1; index > 0; index++) {
        const element = downloadList[index];
        if (element["waiting"]) {
            // start a waiting task
            sendStartDownload(element)
            element["waiting"] = false
        }
    }
}

// merging files failed
ipcRenderer.on("mergeFailed", (event, args) => {
    console.log("merge failed")
    console.log(args["error"])
    updateFailed(args["id"], args["error"])

})

// download failed
ipcRenderer.on("downloadFailed", (event, args) => {
    updateFailed(args["id"], args["error"])
})

// download failed
function updateFailed(id, error) {
    console.log("update gui failed")
    if (JSON.stringify(error).indexOf("cancel") == -1) {
        $("#failed-btn").click()

        var index = downloadList.findIndex((info) => {
            return info["id"] === id
        })
        var item = downloadList[index]
        failedList.push(item)
        downloadList.splice(index, 1)

        console.log(item)
        item["hasError"] = true
        item["error"] = JSON.stringify(error)
        item["finished"] = true
        addFailedItem(item)
        removeDownloadItem(id)
    }
}

// if there's a task going, wait and set waiting flag to true
ipcRenderer.on("wait", (event, args) => {
    var item = downloadList.find(item => item["id"] === args["id"])
    // this if is for a situation that user click the pause button of a already paused item
    if (item["start"]) {
        item["waiting"] = true
    }
})

// initiate the globel variables
$(document).ready(() => {

    // get download path
    if (localStorage.getItem("rootPath")) {
        rootPath = localStorage.getItem("rootPath")
    } else {
        rootPath = require('electron').remote.app.getPath("downloads")
    }
    $("#path-input").val(rootPath)

    // get search history
    if (localStorage.getItem("searchHistory")) {
        // searchHistory = JSON.parse(localStorage.getItem("searchHistory"))
        searchHistory = localStorage.getItem("searchHistory").split(",")
        // update gui
        searchHistory.forEach(avNumber => {
            $("#history-ul").prepend(`<li>${avNumber}</li>`)
        });
    }

    // get lists
    for (var i = 0, len = localStorage.length; i < len; ++i) {
        // console.log(localStorage.getItem(localStorage.key(i)));
        var key = localStorage.key(i)
        if (key != null && key.match(/\d+/)) {
            var value = JSON.parse(localStorage.getItem(key))
            if (value["hasError"]) {
                failedList.push(value)
            } else if (value["finished"]) {
                finishedList.push(value)
            } else {
                downloadList.push(value)
            }

        }
    }

    console.log(downloadList)
    console.log(finishedList)
    console.log(failedList)

    // update gui
    updateDownloadPanel()

    updateFinishedPanel()

    updateFailedPanel()

})

// when the view is about to close, store search history and tasks info
$(window).bind('beforeunload', () => {
    // store search history
    localStorage.setItem("searchHistory", searchHistory)
    // store download list
    downloadList.forEach((elm) => {
        localStorage.setItem(elm["id"], JSON.stringify(elm))
    })
    finishedList.forEach((elm) => {
        localStorage.setItem(elm["id"], JSON.stringify(elm))
    })
    failedList.forEach((elm) => {
        localStorage.setItem(elm["id"], JSON.stringify(elm))
    })
})


$("#search-btn").click(async (e) => {
    // e.preventDefault()

    //reset popup modal content
    resetModalContent()

    var avNumber = $('#avNumber-input').val().trim().match(/av\d+/)
    if (avNumber != null) {
        $("#search-btn").attr("disabled", 'true')

        var videoData = await videoUtil.getInfo(avNumber)

        if (!videoData["hasError"]) {

            // fill modal content with video info
            fillModalContent(videoData, avNumber)

            // give the default choices of pages
            var checkboxDefault = "#check" + videoData["pages"][0]["page"]
            $(checkboxDefault).prop('checked', 'true')

            // if there is only one part, then disable the checkbox
            // just in case page attribute is null
            if (videoData["pages"].length == 1) {
                $("input[type='checkbox']").prop("disabled", 'true')
                $(".checkbox").prop("disabled", 'true')
            }

            // if the video is an old video, set hidden input value to 1
            // old videos are different in url formatting
            $("#input-isOldVideo").attr("value", videoData["isOldVideo"] ? "1" : "0")
            console.log(videoData["isOldVideo"])

        } else {
            // error occurred
            // here if error occurred, do nothing
            console.log(videoData["error"])
        }
        // after modal popup, make search button clickable
        $("#search-btn").removeAttr("disabled")

        //store search history
        searchHistory.push(avNumber)

        // up most 50 piece of history can be stored
        if (searchHistory.length === 50) {
            searchHistory.shift()
            searchHistory.push(avNumber)
        }

        //update history list gui
        $("#history-ul").prepend(`<li>${avNumber}</li>`)

    } else {
        // input is not qualified
        // do nothing
    }

})


$("#get-video-btn").click(async (e) => {

    $("#get-video-btn").attr("disabled", 'true')

    // different part
    var parts = []
    // avNumber
    var avNumber = $("#avNumber-p").text()
    // acceptCode
    var acceptCode = $('input:radio:checked').val()
    // is old video
    var isOldVideo = $("#input-isOldVideo").attr("value") === "0" ? false : true
    console.log($("#input-isOldVideo").attr("value"))
    //get chosen checkbox(s)
    $.each($('input:checkbox:checked'), function () {
        parts.push({
            "part": $(this).val(),
            "partName": $("#label" + $(this).val())
        })
        // console.log($('input[type=checkbox]:checked').length + "个，其中有：" + $(this).val())
    });

    if (parts.length != 0) {

        for (let index = 0; index < parts.length; index++) {
            await videoUtil.getUrl(avNumber, acceptCode, parts[index]["part"], isOldVideo)
                .then((url) => {

                    var videoUrl = {
                        'id': Date.now(),
                        "acceptCode": acceptCode,
                        "avNumber": avNumber,
                        "title": $("#title-p").text(),
                        "part": url["part"],
                        "partName": $("#label" + url["part"]).text(),
                        "isOldVideo": url["isOldVideo"],
                        "audioUrl": url["audioUrl"],
                        "audioProgress": 0,
                        "audioReceived": 0,
                        "videoUrl": url["videoUrl"],
                        "videoProgress": 0,
                        "videoReceived": 0,
                        "start": false,
                        "finished": false,
                        "waiting": false,
                        "hasError": false,
                        "error": {}
                    }

                    // add to downloadList
                    downloadList.push(videoUrl)
                    // update gui
                    addDownloadItem(videoUrl)

                    // ask main process if it can start download
                    sendStartDownload(videoUrl)

                    closeModal()
                    $('#downloading-btn').click()
                })
                .catch((error) => {
                    console.log(error)
                    return
                })
        }
    }
    $("#get-video-btn").removeAttr("disabled")
})

// fill modal content with video info
function fillModalContent(videoData, avNumber) {
    //deal with the pop modal
    $(".modal").addClass("is-active")
    $("#title-p").text(videoData["title"])
    $("#up-p").text(videoData["upName"])
    $("#desc-p").text(videoData["desc"])
    $("#avNumber-p").text(avNumber)

    // add accept radio buttons
    for (var element in videoData["accept"]) {
        var radioDom = "#radio" + element
        var labelDom = "#label" + element
        // console.log(dom)
        $(radioDom).removeClass("hide")
        $(labelDom).removeClass("hide")
        //give a default choice
        $(radioDom).prop("checked", true)
    }

    // add parts checkboxs
    for (let index = 0; index < videoData["pages"].length; index++) {
        const elm = videoData["pages"][index]

        // var label = $(`<label class='checkbox'>${elm["partName"]}</label>`).appendTo("#part-div")
        // label.append(`<input type='checkbox' id='check${elm["page"]}' value='${elm["page"]}'>`)
        // // new line
        // $("#part-div").appendTo("<p></p>")
        $("#part-div").append(
            `<label id="label${elm["page"]}" class='checkbox'>` +
            "<input type='checkbox' " +
            `id='check${elm["page"]}'` +
            `value='${elm["page"]}'>` +
            elm["partName"] +
            "</label><p></p>")
    }
}

//reset popup modal content
function resetModalContent() {
    $("#part-div").empty()
    $("radio").addClass('hide')
    $("radio-parent lable").addClass('hide')
}

// send item info to download process
function sendStartDownload(element) {
    // ask main process if it can start download
    var downloadInfo = {
        "id": element["id"],
        "avNumber": element["avNumber"],
        "part": element["part"],
        "isOldVideo": element["isOldVideo"],
        "videoUrl": element["videoUrl"],
        "audioUrl": element["audioUrl"],
        "videoReceived": element["videoReceived"],
        "audioReceived": element["audioReceived"],
        "rootPath": rootPath
    }
    console.log(element)

    sendToDownloadProcess("startDownload", downloadInfo)
}

// close popup video info panel
$(".modal-close-btn").click((e) => {
    closeModal()
})

// set download path
$("#path-button").click((e) => {
    require('electron').remote.dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        if (result.filePaths.length == 1) {
            rootPath = result.filePaths[0]
            // store
            localStorage.setItem("rootPath", rootPath)
            // update gui
            $("#path-input").val(rootPath)
        }
    }).catch(err => {
        console.log(err)
    })
})

//download list item start downloading
// function startDownload(id) {
//     var part = downloadList.find((item => {
//         return item["id"] === id
//     }))
//     $(`${id}-download-div`)
// }

// delete list item function
function deleteItem(list, id, listPanelDeleteItemFunction) {
    var index = list.findIndex((item) => {
        return item["id"] === id
    })
    list.splice(index, 1)
    listPanelDeleteItemFunction(id)
    localStorage.removeItem(id)

}

// download panel item icon event
function downloadDeleteItem(id) {

    var item = downloadList.find(item => item["id"] === id)
    // if task has started, stop downloadint and merging
    // if tast has not started yet, just remove it from list and gui
    if (item["start"]) {
        sendToDownloadProcess("cancel", { "id": id })
        sendToMergeProcess("cancel", { "id": id })
    }
    deleteItem(downloadList, id, removeDownloadItem)
}

function downloadPauseItem(id) {
    var item = downloadList.find(item => item["id"] === id)
    // if the item is downloading, you can pause
    if (item["start"]) {
        item["start"] = false
        sendToDownloadProcess("cancel", { "id": id })
    }
}

function downloadStartItem(id) {
    var item = downloadList.find(item => item["id"] === id)

    // if the item is not downloading, you can start
    if (!item["start"]) {
        item["start"] = true
        sendStartDownload(item)
    }

}
// finished panel item icon event
function finishedDeleteItem(id) {
    deleteItem(finishedList, id, removeFinishedItem)
}

function finishedStartItem(id) {
    var itemIndex = finishedList.findIndex(item => item["id"] === id)
    var item = finishedList[itemIndex]
    item["start"] = true
    item["finished"] = false
    // add to download list and remove from finished list
    downloadList.push(item)
    finishedList.splice(itemIndex, 1)
    // leave the progress properties to downloadEngine
    sendStartDownload(item)
}
// failed panel item icon event
function failedDeleteItem(id) {
    deleteItem(failedList, id, removeFailedItem)
}

function failedStartItem(id) {
    var itemIndex = failedList.findIndex(item => item["id"] === id)
    var item = failedList[itemIndex]
    item["start"] = true
    item["finished"] = false
    item["hasError"] = false
    item["error"] = {}
    // add to download list and remove from finished list
    downloadList.push(item)
    failedList.splice(itemIndex, 1)
    // leave the progress properties to downloadEngine
    sendStartDownload(item)
}

// chrome does not allow modifying header, so i switch to main process
// send msg to main process
// use sendTo method, still need to go through main process
function sendToDownloadProcess(channel, args) {
    ipcRenderer.send(channel, args)
}

function sendToMergeProcess(channel, args) {
    var mergeWindowId = require('electron').remote.getGlobal('sharedObject').mergeWindowId
    console.log(mergeWindowId)
    ipcRenderer.sendTo(mergeWindowId, channel, args)
}

// switch panel
$('#add-btn').click((e) => {
    e.preventDefault()

    $('#add-btn').addClass('is-active')
    $('#downloading-btn').removeClass('is-active')
    $('#finished-btn').removeClass('is-active')
    $('#failed-btn').removeClass('is-active')

    $('#add').removeClass('hide')
    $('#downloading').addClass('hide')
    $('#finished').addClass('hide')
    $('#failed').addClass('hide')
})

$('#downloading-btn').click((e) => {
    e.preventDefault()


    $('#downloading-btn').addClass('is-active')
    $('#add-btn').removeClass('is-active')
    $('#finished-btn').removeClass('is-active')
    $('#failed-btn').removeClass('is-active')

    $('#downloading').removeClass('hide')
    $('#finished').addClass('hide')
    $('#failed').addClass('hide')
    $('#add').addClass('hide')
})

$('#finished-btn').click((e) => {
    e.preventDefault()

    $('#finished-btn').addClass('is-active')
    $('#downloading-btn').removeClass('is-active')
    $('#add-btn').removeClass('is-active')
    $('#failed-btn').removeClass('is-active')

    $('#finished').removeClass('hide')
    $('#downloading').addClass('hide')
    $('#failed').addClass('hide')
    $('#add').addClass('hide')
})

$('#failed-btn').click((e) => {
    e.preventDefault()

    $('#failed-btn').addClass('is-active')
    $('#downloading-btn').removeClass('is-active')
    $('#finished-btn').removeClass('is-active')
    $('#add-btn').removeClass('is-active')

    $('#failed').removeClass('hide')
    $('#downloading').addClass('hide')
    $('#finished').addClass('hide')
    $('#add').addClass('hide')
})

// close the popup video info panel
function closeModal() {
    $(".modal").removeClass("is-active")
}

// use jquery add render lists, planning to replace it with vue 
function addDownloadItem(videoUrl) {
    // video info
    var v1 = $(`<div id="${videoUrl["id"]}-download-div" class="tile is-ancestor"></div>`).appendTo("#downloadListContainer")
    var v2 = $('<div class="tile is-parent"></div>').appendTo(v1)
    var v3 = $('<div class="tile is-child box"></div').appendTo(v2)
    var v4 = $('<div class="field"></div>').appendTo(v3)
    v4.append(`<span class="title is-4">${videoUrl["avNumber"]}-${videoUrl["title"]}</span>`)
    // part
    var v6 = $(`<div id="${videoUrl["id"]}-div" class="field"></div>`).appendTo(v4)
    v6.append(`<span class="title is-6">Part${videoUrl["part"]}-${videoUrl["partName"]}</span>`)
        .append(`<span onclick="downloadStartItem(${videoUrl["id"]})" class="icon"><a><i class="fa fa-play"></i></a></span>`)
        .append(`<span onclick="downloadPauseItem(${videoUrl["id"]})" class="icon"><a><i class="fa fa-pause"></i></a></span>`)
        .append(`<span onclick="downloadDeleteItem(${videoUrl["id"]})" class="icon"><a><i class="fa fa-ban"></i></a></span>`)
        .append('<p></p>')
        .append(`<span id='${videoUrl["id"]}-v-span'>video progress:${videoUrl["videoProgress"]}</span>`)
        .append(`<progress id='${videoUrl["id"]}-v-progress' class="progress is-primary is-small small-bottom-margin" value='${videoUrl["videoProgress"]}' max="100"></progress>`)
        .append(`<span id='${videoUrl["id"]}-a-span'>audio progress:${videoUrl["audioProgress"]}</span>`)
        .append(`<progress id="${videoUrl["id"]}-a-progress" class="progress is-primary is-small small-bottom-margin" value="${videoUrl["audioProgress"]}" max="100"></progress>`)
        .append(`<label id="${videoUrl["id"]}-m-label" class="label hide">merging videio and audio, this can really take a while</label>`)
}

function removeDownloadItem(id) {
    $(`#${id}-download-div`).remove()
}

function updateDownloadPanel() {
    for (let index = 0; index < downloadList.length; index++) {
        addDownloadItem(downloadList[index])
    }
}

function addFinishedItem(videoUrl) {
    // video info
    var v1 = $(`<div id="${videoUrl["id"]}-finished-div" class="tile is-ancestor"></div>`).appendTo("#finishedListContainer")
    var v2 = $('<div class="tile is-parent"></div>').appendTo(v1)
    var v3 = $('<div class="tile is-child box"></div').appendTo(v2)
    var v4 = $('<div class="field"></div>').appendTo(v3)
    var v5 = v4.append(`<p class="title is-4">${videoUrl["avNumber"]}-${videoUrl["title"]}</p>`)
    // part
    var v6 = $(`<div id="${videoUrl["id"]}-div" class="field"></div>`).appendTo(v5)
    v6.append(`<span class="title is-6">Part${videoUrl["part"]}-${videoUrl["partName"]}</span>`)
        .append(`<span onclick="finishedStartItem(${videoUrl["id"]})"  class="icon"><a><i class="fa fa-play"></i></a></span>`)
        .append(`<span onclick="finishedDeleteItem(${videoUrl["id"]})" class="icon"><a><i class="fa fa-ban"></i></a></span>`)
}

function removeFinishedItem(id) {
    $(`#${id}-finished-div`).remove()
}

function updateFinishedPanel() {
    for (let index = 0; index < finishedList.length; index++) {
        addFinishedItem(finishedList[index])
    }
}

function addFailedItem(videoUrl) {
    // video info
    var v1 = $(`<div id="${videoUrl["id"]}-failed-div" class="tile is-ancestor"></div>`).appendTo("#failedListContainer")
    var v2 = $('<div class="tile is-parent"></div>').appendTo(v1)
    var v3 = $('<div class="tile is-child box"></div').appendTo(v2)
    var v4 = $('<div class="field"></div>').appendTo(v3)
    var v5 = v4.append(`<p class="title is-4">${videoUrl["avNumber"]}-${videoUrl["title"]}</p>`)
    // part
    var v6 = $(`<div id="${videoUrl["id"]}-div" class="field"></div>`).appendTo(v5)
    v6.append(`<span class="title is-6">Part${videoUrl["part"]}-${videoUrl["partName"]}</span>`)
        .append(`<span onclick="failedStartItem(${videoUrl["id"]})"  class="icon"><a><i class="fa fa-play"></i></a></span>`)
        .append(`<span onclick="failedDeleteItem(${videoUrl["id"]})" class="icon"><a><i class="fa fa-ban"></i></a></span>`)
        .append(`<p>${videoUrl["error"]}</p>`)
}

function removeFailedItem(id) {
    $(`#${id}-failed-div`).remove()
}

function updateFailedPanel() {
    for (let index = 0; index < failedList.length; index++) {
        addFailedItem(failedList[index])
    }
}

function getDownloadingPart(id) {
    return downloadingPart
}

// $("#test-btn").click(async (event) => {
//     var videoData = await videoUtil.getInfo("https://www.bilibili.com/video/" + $('#avNumber-input').val().trim())
//     console.log(videoData)
// })