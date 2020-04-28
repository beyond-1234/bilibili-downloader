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
}