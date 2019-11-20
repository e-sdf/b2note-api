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
    return await anCol.find(query).toArray();
}
async function getAnnotationsForTag(anCol, query) {
    return anCol.find({ "body.items": { "$elemMatch": { value: query.tag } } }).toArray();
}
exports.getAnnotationsForTag = getAnnotationsForTag;
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