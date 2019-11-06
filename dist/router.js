"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logging_1 = require("./logging");
const responses = __importStar(require("./responses"));
const an = __importStar(require("./shared/annotation"));
const db = __importStar(require("./db"));
const router = express_1.Router();
function mkResponse(id) {
    const ts = an.mkTimestamp();
    return {
        _updated: ts,
        _created: ts,
        _id: id,
        _links: {
            self: {
                title: "Annotation",
                href: "annotations/" + id
            }
        },
        _status: "OK"
    };
}
function handleError(resp, error) {
    logging_1.logError(error);
    responses.serverErr(resp, error, "Internal server error");
}
// Handlers {{{1
// Get all annotations TODO: filter by user
router.get("/annotations", (req, resp) => {
    db.getClient().then(client => db.getAnnotations(db.getCollection(client)).then(anl => responses.ok(resp, anl), error => handleError(resp, error)), error => handleError(resp, error));
});
// Create a new annotation 
router.post("/annotations", (req, resp) => {
    const annotation = req.body;
    db.addAnnotation(annotation).then(newId => {
        if (newId) { // annotation saved
            responses.created(resp, mkResponse(newId));
        }
        else { // annotation already exists
            responses.forbidden(resp, { message: "Annotation already exists" });
        }
    }).catch(err => responses.serverErr(resp, err, "Internal server error"));
});
exports.default = router;
