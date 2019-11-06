"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("./logging");
function clientErr(resp, msg) {
    resp.status(400);
    resp.send(msg);
}
exports.clientErr = clientErr;
function serverErr(resp, error, msg) {
    logging_1.logError(error);
    resp.status(500);
    resp.send(msg);
}
exports.serverErr = serverErr;
function ok(resp, result) {
    resp.status(200);
    resp.json(result || { message: "OK" });
}
exports.ok = ok;
function created(resp, result) {
    resp.status(201);
    resp.json(result || { message: "Created" });
}
exports.created = created;
function forbidden(resp, result) {
    resp.status(403);
    resp.json(result || { message: "Forbidden" });
}
exports.forbidden = forbidden;
