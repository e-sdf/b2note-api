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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwL3Jlc3BvbnNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVDQUFxQztBQUVyQyxTQUFnQixTQUFTLENBQUMsSUFBYyxFQUFFLEdBQVc7SUFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLENBQUM7QUFIRCw4QkFHQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUFjLEVBQUUsS0FBYSxFQUFFLEdBQVc7SUFDbEUsa0JBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakIsQ0FBQztBQUpELDhCQUlDO0FBRUQsU0FBZ0IsRUFBRSxDQUFDLElBQWMsRUFBRSxNQUFlO0lBQ2hELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBSEQsZ0JBR0M7QUFFRCxTQUFnQixPQUFPLENBQUMsSUFBYyxFQUFFLE1BQWU7SUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFIRCwwQkFHQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUFjLEVBQUUsTUFBZTtJQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUhELDhCQUdDIn0=