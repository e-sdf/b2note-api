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
// DB Access {{{1
async function getClient() {
    return mongodb_1.MongoClient.connect(config_1.default.mongodbUrl, { useUnifiedTopology: true });
}
exports.getClient = getClient;
function getCollection(dbClient) {
    return dbClient.db(config_1.default.dbName).collection(colName);
}
exports.getCollection = getCollection;
// Filters {{{1
function mkTargetSourceFilter(query) {
    const ff = query["target-source"];
    return (ff ? { "target.source": ff } : {});
}
function mkAuthorFilter(query) {
    const c = query["creator-filter"];
    return (c ?
        c.includes(an.CreatorFilter.MINE) && !c.includes(an.CreatorFilter.OTHERS) ?
            { "creator.id": query.user }
            : c.includes(an.CreatorFilter.OTHERS) && !c.includes(an.CreatorFilter.MINE) ?
                { "creator.id": { "$not": { "$eq": query.user } } }
                : {}
        : {});
}
function mkTypeFilter(query) {
    var _a, _b, _c;
    const semanticFilter = ((_a = query["type-filter"]) === null || _a === void 0 ? void 0 : _a.includes(an.TypeFilter.SEMANTIC)) ? {
        motivation: an.PurposeType.TAGGING,
        "body.items.type": an.BodyItemType.SPECIFIC_RESOURCE
    } : {};
    const keywordFilter = ((_b = query["type-filter"]) === null || _b === void 0 ? void 0 : _b.includes(an.TypeFilter.KEYWORD)) ? {
        motivation: an.PurposeType.TAGGING,
        "body.items": { "$not": { "$elemMatch": { type: an.BodyItemType.SPECIFIC_RESOURCE } } }
    } : {};
    const commentFilter = ((_c = query["type-filter"]) === null || _c === void 0 ? void 0 : _c.includes(an.TypeFilter.COMMENT)) ? {
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
// Queries {{{1
async function findAnnotationsOfTarget(anCol, id, source) {
    const query = { "target.id": id, "target.source": source };
    const res = await anCol.find(query);
    return res.toArray();
}
// DB API {{{1
function getAnnotations(anCol, query) {
    console.log(JSON.stringify(mkTargetSourceFilter(query)));
    const filter = {
        ...mkTargetSourceFilter(query),
        ...mkAuthorFilter(query),
        ...mkTypeFilter(query),
    };
    return isEmptyFilter(filter) ? Promise.resolve([]) : anCol.find(filter).toArray();
}
exports.getAnnotations = getAnnotations;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9hcHAvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMENBQTRCO0FBQzVCLHFDQUFrRDtBQUNsRCxzREFBOEI7QUFDOUIsd0RBQTBDO0FBRTFDLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQztBQUU5QixpQkFBaUI7QUFFVixLQUFLLFVBQVUsU0FBUztJQUM3QixPQUFPLHFCQUFXLENBQUMsT0FBTyxDQUFDLGdCQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RSxDQUFDO0FBRkQsOEJBRUM7QUFFRCxTQUFnQixhQUFhLENBQUMsUUFBcUI7SUFDakQsT0FBTyxRQUFRLENBQUMsRUFBRSxDQUFDLGdCQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFGRCxzQ0FFQztBQUVELGVBQWU7QUFFZixTQUFTLG9CQUFvQixDQUFDLEtBQWtCO0lBQzlDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNsQyxPQUFPLENBQ0wsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUNuQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLEtBQWtCO0lBQ3hDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xDLE9BQU8sQ0FDTCxDQUFDLENBQUMsQ0FBQztRQUNELENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLEVBQUUsWUFBWSxFQUFF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