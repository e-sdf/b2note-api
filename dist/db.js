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
const an = __importStar(require("./shared/annotation"));
const colName = "annotations";
// Database routines {{{1
async function getClient() {
    return mongodb_1.MongoClient.connect(config_1.default.mongodbUrl, { useUnifiedTopology: true });
}
exports.getClient = getClient;
function getCollection(dbClient) {
    return dbClient.db(config_1.default.dbName).collection(colName);
}
exports.getCollection = getCollection;
function mkTypeFilter(query) {
    var _a, _b, _c;
    const semanticFilter = ((_a = query.type) === null || _a === void 0 ? void 0 : _a.includes(an.TypeFilter.SEMANTIC)) ? {
        motivation: an.PurposeType.TAGGING,
        "body.items.type": an.BodyItemType.SPECIFIC_RESOURCE
    } : {};
    const keywordFilter = ((_b = query.type) === null || _b === void 0 ? void 0 : _b.includes(an.TypeFilter.KEYWORD)) ? {
        motivation: an.PurposeType.TAGGING,
        "body.items": { "$not": { "$elemMatch": { type: an.BodyItemType.SPECIFIC_RESOURCE } } }
    } : {};
    const commentFilter = ((_c = query.type) === null || _c === void 0 ? void 0 : _c.includes(an.TypeFilter.COMMENT)) ? {
        motivation: an.PurposeType.COMMENTING
    } : {};
    const typeFilters = [{ ...semanticFilter }, { ...keywordFilter }, { ...commentFilter }].filter(i => { return !_.isEmpty(i); });
    const filter = { "$or": typeFilters };
    return filter;
}
function isEmptyFilter(filter) {
    var _a;
    return ((_a = filter["$or"]) === null || _a === void 0 ? void 0 : _a.length) === 0;
}
function getAnnotations(anCol, query) {
    const filter = mkTypeFilter(query);
    return isEmptyFilter(filter) ? Promise.resolve([]) : anCol.find(filter).toArray();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9hcHAvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMENBQTRCO0FBQzVCLHFDQUFrRDtBQUNsRCxzREFBOEI7QUFDOUIsd0RBQTBDO0FBRTFDLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQztBQUU5Qix5QkFBeUI7QUFDbEIsS0FBSyxVQUFVLFNBQVM7SUFDN0IsT0FBTyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxnQkFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDOUUsQ0FBQztBQUZELDhCQUVDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLFFBQXFCO0lBQ2pELE9BQU8sUUFBUSxDQUFDLEVBQUUsQ0FBQyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRkQsc0NBRUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxLQUFrQjs7SUFDdEMsTUFBTSxjQUFjLEdBQUcsT0FBQSxLQUFLLENBQUMsSUFBSSwwQ0FBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUUsQ0FBQyxDQUFDO1FBQ3BFLFVBQVUsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU87UUFDbEMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxpQkFBaUI7S0FDckQsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ1AsTUFBTSxhQUFhLEdBQUcsT0FBQSxLQUFLLENBQUMsSUFBSSwwQ0FBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEdBQUUsQ0FBQyxDQUFDO1FBQ2xFLFVBQVUsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU87UUFDbEMsWUFBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsSUFBSSxF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