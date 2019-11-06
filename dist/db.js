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
const mongodb_1 = require("mongodb");
const config_1 = __importDefault(require("./config"));
const colName = "annotations";
// Database routines {{{1
async function getClient() {
    return mongodb_1.MongoClient.connect(config_1.default.mongodbUrl);
}
exports.getClient = getClient;
function getCollection(dbClient) {
    return dbClient.db(config_1.default.dbName).collection(colName);
}
exports.getCollection = getCollection;
function getAnnotations(anCol) {
    return anCol.find().toArray();
}
exports.getAnnotations = getAnnotations;
async function findAnnotationsOfTarget(anCol, id, source) {
    const query = { "target.id": id, "target.source": source };
    const res = await anCol.find(query);
    return res.toArray();
}
exports.findAnnotationsOfTarget = findAnnotationsOfTarget;
async function addAnnotation(annotation) {
    const dbClient = await getClient();
    const anCol = getCollection(dbClient);
    const annotations = await findAnnotationsOfTarget(anCol, annotation.target.id, annotation.target.source);
    const existing = annotations.find((an) => _.isEqual(an.body.items, annotation.body.items));
    if (existing) {
        await dbClient.close();
        return null;
    }
    else {
        const res = await anCol.insertOne(annotation);
        const newId = res.insertedId;
        await anCol.findOneAndUpdate({ _id: newId }, { "$set": { id: "/api/annotations/" + newId } });
        await dbClient.close();
        return newId;
    }
}
exports.addAnnotation = addAnnotation;
