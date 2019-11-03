"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mkTimestamp() {
    const twoDigits = (n) => n.length === 1 ? "0" + n : n;
    const d = new Date();
    const yyyy = d.getFullYear().toString();
    const mm = twoDigits(d.getMonth().toString());
    const dd = twoDigits(d.getDate().toString());
    const hh = twoDigits(d.getHours().toString());
    const mi = twoDigits(d.getMinutes().toString());
    const ss = twoDigits(d.getSeconds().toString());
    const ms = d.getMilliseconds().toString();
    return yyyy + "-" + mm + "-" + dd +
        "T" + hh + ":" + mi + ":" + ss + "." + ms;
}
exports.mkTimestamp = mkTimestamp;
