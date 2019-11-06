"use strict";
// Types {{{1
Object.defineProperty(exports, "__esModule", { value: true });
// Record Creation {{{1
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
// Record Accessing {{{1
function getLabel(anRecord) {
    const item = anRecord.body.items.find((i) => i.type === "TextualBody");
    if (!item) {
        throw new Error("TextualBody record not found in body item");
    }
    else {
        if (!item.value) {
            throw new Error("Value field not found in TextualBody item");
        }
        else {
            return item.value;
        }
    }
}
exports.getLabel = getLabel;
