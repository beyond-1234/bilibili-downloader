import {
    NUMBER,
    TITLE,
    DESC,
    ACCEPTS,
    IS_OLD_VIDEO,
    UP_NAME,
    PAGE_COUNT,
    URLS,
    HAS_ERROR,
    ERROR,
    VIDEO_PAGES
} from "../constants";

export function clone(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}

export function getEmptyVideoData() {
    return {
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
}