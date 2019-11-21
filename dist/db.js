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
const anModel = __importStar(require("./shared/annotationsModel"));
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
        c.includes(anModel.CreatorFilter.MINE) && !c.includes(anModel.CreatorFilter.OTHERS) ?
            { "creator.id": query.user }
            : c.includes(anModel.CreatorFilter.OTHERS) && !c.includes(anModel.CreatorFilter.MINE) ?
                { "creator.id": { "$not": { "$eq": query.user } } }
                : {}
        : {});
}
function mkTypeFilter(query) {
    var _a, _b, _c;
    const semanticFilter = ((_a = query["type-filter"]) === null || _a === void 0 ? void 0 : _a.includes(anModel.TypeFilter.SEMANTIC)) ? {
        motivation: anModel.PurposeType.TAGGING,
        "body.items.type": anModel.BodyItemType.SPECIFIC_RESOURCE
    } : {};
    const keywordFilter = ((_b = query["type-filter"]) === null || _b === void 0 ? void 0 : _b.includes(anModel.TypeFilter.KEYWORD)) ? {
        motivation: anModel.PurposeType.TAGGING,
        "body.items": { "$not": { "$elemMatch": { type: anModel.BodyItemType.SPECIFIC_RESOURCE } } }
    } : {};
    const commentFilter = ((_c = query["type-filter"]) === null || _c === void 0 ? void 0 : _c.includes(anModel.TypeFilter.COMMENT)) ? {
        motivation: anModel.PurposeType.COMMENTING
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
    const existing = annotations.find((an) => _.isEqual(anModel.body.items, annotation.body.items));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9hcHAvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMENBQTRCO0FBQzVCLHFDQUFrRDtBQUNsRCxzREFBOEI7QUFDOUIsbUVBQXFEO0FBRXJELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQztBQUU5QixpQkFBaUI7QUFFVixLQUFLLFVBQVUsU0FBUztJQUM3QixPQUFPLHFCQUFXLENBQUMsT0FBTyxDQUFDLGdCQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RSxDQUFDO0FBRkQsOEJBRUM7QUFFRCxTQUFnQixhQUFhLENBQUMsUUFBcUI7SUFDakQsT0FBTyxRQUFRLENBQUMsRUFBRSxDQUFDLGdCQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFGRCxzQ0FFQztBQUVELGVBQWU7QUFFZixTQUFTLG9CQUFvQixDQUFDLEtBQXVCO0lBQ25ELE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNsQyxPQUFPLENBQ0wsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUNuQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLEtBQXVCO0lBQzdDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xDLE9BQU8sQ0FDTCxDQUFDLENBQUMsQ0FBQztRQUNELENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ25GLEVBQUUsWUFBWSxFQUFF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