import * as _ from "lodash";
import { MongoClient, Collection } from "mongodb";
import config from "./config";
import * as anModel from "./shared/annotationsModel";

const colName = "annotations";

// DB Access {{{1

export async function getClient(): Promise<MongoClient> {
  return MongoClient.connect(config.mongodbUrl, { useUnifiedTopology: true });
}

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db(config.dbName).collection(colName);
}

// Filters {{{1

function mkTargetSourceFilter(query: anModel.GetQuery): Record<string, any> {
  const ff = query["target-source"];
  return (
    ff ? { "target.source": ff } : { }
  );
}

function mkAuthorFilter(query: anModel.GetQuery): Record<string, any> {
  const c = query["creator-filter"];
  return (
    c ?
      c.includes(anModel.CreatorFilter.MINE) && !c.includes(anModel.CreatorFilter.OTHERS) ? 
        { "creator.id": query.user }
      : c.includes(anModel.CreatorFilter.OTHERS) && !c.includes(anModel.CreatorFilter.MINE) ?
        { "creator.id": { "$not": { "$eq": query.user } } }
      : {}
    : {}
  );
}

function mkTypeFilter(query: anModel.GetQuery): Record<string, any> {
  const semanticFilter = query["type-filter"]?.includes(anModel.TypeFilter.SEMANTIC) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.items.type": anModel.BodyItemType.SPECIFIC_RESOURCE 
  } : {};
  const keywordFilter = query["type-filter"]?.includes(anModel.TypeFilter.KEYWORD) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.items": { "$not": { "$elemMatch": { type: anModel.BodyItemType.SPECIFIC_RESOURCE } } } 
  } : {};
  const commentFilter = query["type-filter"]?.includes(anModel.TypeFilter.COMMENT) ? { 
    motivation: anModel.PurposeType.COMMENTING 
  } : {};
  const typeFilters = [{...semanticFilter}, {...keywordFilter}, {...commentFilter}].filter(i => { return !_.isEmpty(i); });
  const filter = { "$or": typeFilters};
  return filter;
}

function isEmptyFilter(filter: Record<string, any>): boolean {
  return filter["$or"]?.length === 0;
}

// Queries {{{1

async function findAnnotationsOfTarget(anCol: Collection, id: string, source: string): Promise<Array<anModel.AnRecord>> {
  const query = { "target.id": id, "target.source": source };
  return await anCol.find(query).toArray();
}

export async function getAnnotationsForTag(anCol: Collection, query: anModel.FilesQuery): Promise<Array<anModel.AnRecord>> {
  return anCol.find({ "body.items": { "$elemMatch": { value: query.tag } } }).toArray();
}

// DB API {{{1

export function getAnnotations(anCol: Collection, query: anModel.GetQuery): Promise<Array<anModel.AnRecord>> {
  console.log(JSON.stringify(mkTargetSourceFilter(query)));
  const filter = {
    ...mkTargetSourceFilter(query),
    ...mkAuthorFilter(query),
    ...mkTypeFilter(query),
  };
  return isEmptyFilter(filter) ? Promise.resolve([]) : anCol.find(filter).toArray();
}

export async function addAnnotation(annotation: anModel.AnRecord): Promise<string|null> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const annotations = await findAnnotationsOfTarget(anCol, annotation.target.id, annotation.target.source);
  const existing = annotations.find((an: anModel.AnRecord) => _.isEqual(anModel.body.items, annotation.body.items));
  if (existing) {
    await dbClient.close();
    return null;
  } else {
    const res = await anCol.insertOne(annotation);
    const newId = res.insertedId as string;
    await anCol.findOneAndUpdate({ _id: newId }, { "$set": { id: "/api/annotations/" + newId } });  
    await dbClient.close();
    return newId;
  }
}

