"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("./logging");
function clientErrRes(res, msg) {
    res.status(400);
    res.send(msg);
}
exports.clientErrRes = clientErrRes;
function serverErrRes(res, msg) {
    logging_1.error(msg);
    res.status(500);
    res.send(msg);
}
exports.serverErrRes = serverErrRes;
function okRes(res, result) {
    res.status(200);
    res.json(result);
}
exports.okRes = okRes;
