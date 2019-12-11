import * as _ from "lodash";
import { MongoClient, Collection, ObjectId } from "mongodb";
import config from "./config";
import { endpointUrl, apiUrl } from "./shared/server";
import * as anModel from "./shared/annotationsModel";
import * as sModel from "./shared/searchModel";

const colName = "annotations";

type DBQuery = Record<string, any>;

// DB Access {{{1

export async function getClient(): Promise<MongoClient> {
  return MongoClient.connect(config.mongodbUrl, { useUnifiedTopology: true });
}

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db(config.dbName).collection(colName);
}

// Filters {{{1

function mkTargetSourceFilter(query: anModel.GetQuery): DBQuery {
  const ff = query["target-source"];
  return (
    ff ? { "target.source": ff } : { }
  );
}

function mkAuthorFilter(query: anModel.GetQuery): DBQuery {
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

function mkTypeFilter(query: anModel.GetQuery): DBQuery {
  const semanticFilter = query["type-filter"]?.includes(anModel.TypeFilter.SEMANTIC) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.COMPOSITE
  } : {};
  const keywordFilter = query["type-filter"]?.includes(anModel.TypeFilter.KEYWORD) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY 
  } : {};
  const commentFilter = query["type-filter"]?.includes(anModel.TypeFilter.COMMENT) ? { 
    motivation: anModel.PurposeType.COMMENTING ,
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY 
  } : {};
  const typeFilters = [{...semanticFilter}, {...keywordFilter}, {...commentFilter}].filter(i => { return !_.isEmpty(i); });
  const filter = { "$or": typeFilters};
  return filter;
}

function isEmptyFilter(filter: DBQuery): boolean {
  return filter["$or"]?.length === 0;
}

// Queries {{{1

async function findAnnotationsOfTarget(anCol: Collection, id: string, source: string): Promise<Array<anModel.AnRecord>> {
  const query = { "target.id": id, "target.source": source };
  return await anCol.find(query).toArray();
}

export async function getAnnotationsForTag(anCol: Collection, value: string): Promise<Array<anModel.AnRecord>> {
  return anCol.find({
    "$or": [
      { "body.value": value },
      { "body.items": { "$elemMatch": { value } } }
    ]
  }).toArray();
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
  const existing = annotations.find((an: anModel.AnRecord) => anModel.getLabel(an) === anModel.getLabel(annotation));
  if (existing) {
    await dbClient.close();
    return null;
  } else {
    const res = await anCol.insertOne(annotation);
    const newId = res.insertedId as string;
    await anCol.findOneAndUpdate({ _id: newId }, { "$set": { id: endpointUrl + apiUrl + anModel.annotationsUrl + "/" + newId } });  
    await dbClient.close();
    return newId;
  }
}

export async function updateAnnotation(anId: string, changes: Record<keyof anModel.AnRecord, string>): Promise<number> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const res = await anCol.updateOne({ _id: new ObjectId(anId) }, { "$set": changes });
  await dbClient.close();
  return res.modifiedCount;
}

export async function deleteAnnotation(anId: string): Promise<number> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const res = await anCol.deleteOne({ _id: new ObjectId(anId) });
  await dbClient.close();
  return res.result.n || 0;
}

function mkSemanticDBQuery(value: string): DBQuery {
  return {
    "body.type": anModel.AnBodyItemType.COMPOSITE,
    "body.items": { "$elemMatch": { value } }
  };
}

function mkKeywordDBQuery(value: string): DBQuery {
  return {
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY,
    "motivation": anModel.PurposeType.TAGGING,
    "body.value": value
  };
}

function mkCommentDBQuery(value: string): DBQuery {
  return {
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY,
    "motivation": anModel.PurposeType.COMMENTING,
    "body.value": value
  };
}

export async function searchRecords(anCol: Collection, query: sModel.SearchQuery): Promise<Array<anModel.AnRecord>> {
  function term2dbQuery(term: sModel.SearchTerm): DBQuery {
    return (
      term.type === anModel.TypeFilter.SEMANTIC ?
        mkSemanticDBQuery(term.label)
      : term.type === anModel.TypeFilter.KEYWORD ?
        mkKeywordDBQuery(term.label)
      : term.type === anModel.TypeFilter.COMMENT ?
        mkCommentDBQuery(term.label)
      : { error: "Unknown tag type" }
    );
  }
  function mkDbOperator(operator: sModel.OperatorType): string {
    return ( 
      operator === sModel.OperatorType.AND ? "$and"
    : operator === sModel.OperatorType.AND_NOT ? "TODO"
    : operator === sModel.OperatorType.XOR ? "$xor"
    : operator === sModel.OperatorType.OR ? "$or"
    : "unknown operator"
   );
  }

  //const dbQuery: DBQuery = 
    //dbQueryTerms.length === 1 ? 
      //dbQueryTerms[0]
    //: query.terms.reduce(
      //(res: DBQuery, term: sModel.SearchTerm) => ({
        //term.operator ? { ...res, [term2dbQuery(term)]: [ mkDbOperator(term.operator) ] } : { error: "Term operator not expected" }
      //}),
      //{ }

  //);
  console.log(JSON.stringify(dbQuery, null, 2));
  //return anCol.find(dbQuery).toArray();
  return [];
}


