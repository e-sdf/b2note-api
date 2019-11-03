"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const responses = __importStar(require("./responses"));
const config_1 = __importDefault(require("./config"));
const an = __importStar(require("./shared/annotation"));
var router = express_1.Router();
const colName = "annotations";
// Database routines {{{1
async function getDbClient(resp) {
    return mongodb_1.MongoClient.connect(config_1.default.mongodbUrl);
}
function getCollection(dbClient) {
    return dbClient.db(config_1.default.dbName).collection(colName);
}
async function findAnnotationsOfTarget(anCol, id, source) {
    const query = { "target.id": id, "target.source": source };
    const res = await anCol.find(query);
    return res.toArray();
}
async function addAnnotation(resp, annotation) {
    const dbClient = await getDbClient(resp);
    const anCol = getCollection(dbClient);
    const annotations = await findAnnotationsOfTarget(anCol, annotation.target.id, annotation.target.source);
    const existing = annotations.find((an) => _.isEqual(an.body.items, annotation.body.items));
    if (existing) {
        await dbClient.close();
        return null;
    }
    else {
        const res = anCol.insertOne(annotation);
        await dbClient.close();
        return res;
    }
}
// Response creation {{{1
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
        "_status": "OK"
    };
}
// Handlers {{{1
// Create a new annotation 
router.post("/annotations", (req, resp) => {
    const annotation = req.body;
    addAnnotation(resp, annotation).then(res => {
        if (res) { // annotation saved
            responses.created(resp, mkResponse(res.insertedId));
        }
        else { // annotation already exists
            responses.forbidden(resp, { message: "Annotation already exists" });
        }
    }).catch(err => responses.serverErr(resp, err, "Internal server error"));
});
exports.default = router;
