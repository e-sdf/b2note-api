import * as _ from "lodash";
import { MongoClient, Collection, ObjectId } from "mongodb";
import config from "./config";
import { endpointUrl, apiUrl } from "./core/server";
import * as anModel from "./core/annotationsModel";
import { SearchType, BiOperatorExpr, BiOperatorType, UnOperatorExpr, UnOperatorType, TagExpr, isBinaryExpr, isUnaryExpr, isTagExpr, Sexpr } from "./core/searchModel";
import { OntologyDict, OntologyInfo, getOntologies } from "./core/ontologyRegister";

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

function mkTypeFilter(query: anModel.GetQuery): DBQuery {
  const semanticFilter = query["type"]?.includes(anModel.TypeFilter.SEMANTIC) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.COMPOSITE
  } : {};
  const keywordFilter = query["type"]?.includes(anModel.TypeFilter.KEYWORD) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY 
  } : {};
  const commentFilter = query["type"]?.includes(anModel.TypeFilter.COMMENT) ? { 
    motivation: anModel.PurposeType.COMMENTING ,
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY 
  } : {};
  const typeFilters = [{...semanticFilter}, {...keywordFilter}, {...commentFilter}].filter(i => { return !_.isEmpty(i); });
  const filter = { "$or": typeFilters};
  return filter;
}

function mkCreatorFilter(query: anModel.GetQuery): DBQuery {
  return query.creator ? { "creator.id": query.creator } : {};
}

function mkTargetSourceFilter(query: anModel.GetQuery): DBQuery {
  const ff = query["target-source"];
  return (
    ff ? { "target.source": ff } : { }
  );
}

function mkValueFilter(query: anModel.GetQuery): DBQuery {
  return query.value ? { "$or": [
    { "body.value": query.value }, // keyword and comment 
    { "body.items": { "$elemMatch": { value: query.value } } } // semantic
  ] }
  : {};
}

function isEmptyFilter(filter: DBQuery): boolean {
  return filter["$or"]?.length === 0;
}

// Queries {{{1

function findAnnotationsOfTarget(anCol: Collection, id: string, source: string): Promise<Array<anModel.AnRecord>> {
  const query = { "target.id": id, "target.source": source };
  return anCol.find(query).toArray();
}

export async function getSemanticAnnotation(anCol: Collection, tag: string): Promise<anModel.AnRecord|null> {
  const res = await anCol.find({ "body.items": { "$elemMatch": { value: tag } } }).toArray();
  return res[0];
}

export function getAnnotationsForTag(anCol: Collection, value: string): Promise<Array<anModel.AnRecord>> {
  return anCol.find({
    "$or": [
      { "body.value": value },
      { "body.items": { "$elemMatch": { value } } }
    ]
  }).toArray();
}

// DB API {{{1

export function getAnnotations(anCol: Collection, query: anModel.GetQuery): Promise<Array<anModel.AnRecord>> {
  const filter = {
    ...mkTypeFilter(query),
    ...mkCreatorFilter(query),
    ...mkTargetSourceFilter(query),
    ...mkValueFilter(query)
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

// Searching {{{1

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

function mkRegexDBQuery(regex: string): DBQuery {
  return {
    "$or": [
      { "body.value": { "$regex": regex } },
      { "body.items": { "$elemMatch": { "$regex": regex } } }
    ]
  };
}

function mkTagQuery(tagExpr: TagExpr): DBQuery {
  //console.log(tagExpr);
  const val = tagExpr.value;
  switch (tagExpr.type) {
    case SearchType.SEMANTIC: return mkSemanticDBQuery(val);
    case SearchType.KEYWORD: return mkKeywordDBQuery(val);
    case SearchType.COMMENT: return mkCommentDBQuery(val);
    case SearchType.REGEX: return mkRegexDBQuery(val);
    default: throw new Error("query type " + tagExpr.type + "not implemented");
  }
}

function mkUnaryQuery(unExpr: UnOperatorExpr): DBQuery {
  if (unExpr.operator !== UnOperatorType.NOT) { throw new Error("Just NOT unary operator implemented"); }
  return {
    "$not": mkExprQuery(unExpr.expr)
  };
}

function mkBinaryQuery(biExpr: BiOperatorExpr): DBQuery {

  function mkOperator(operator: BiOperatorType): string {
    switch (operator) {
      case BiOperatorType.AND: return "$and";
      case BiOperatorType.OR: return "$or";
      case BiOperatorType.XOR: return "$xor";
      default: throw new Error("Unknown binary operator");
    }
  }

  return {
    [mkOperator(biExpr.operator)]: [ mkExprQuery(biExpr.lexpr), mkExprQuery(biExpr.rexpr)]
  };
}

function mkExprQuery(sExpr: Sexpr): DBQuery {
  return (
      isTagExpr(sExpr) ? mkTagQuery(sExpr as TagExpr)
    : isUnaryExpr(sExpr) ? mkUnaryQuery(sExpr as UnOperatorExpr)
    : mkBinaryQuery(sExpr as BiOperatorExpr)
  );
}

async function enrichExprWithSynonyms(sExpr: Sexpr): Promise<Sexpr> {

  async function expandSynonymsToExpr(tagExpr: TagExpr): Promise<Sexpr> {
    console.log(tagExpr);
    return (
      tagExpr.synonymsFlag ?
        (async () => {
          const ontologiesDict: OntologyDict = await getOntologies(tagExpr.value);
          const ontologies = ontologiesDict[tagExpr.value.toLocaleLowerCase()];
          const synonyms = ontologies.reduce(
            (acc: Array<string>, o: OntologyInfo) => [ ...acc,  ...o.synonyms  ],
            []
          );
          console.log(synonyms);
          //TODO: make synonyms expr
          return tagExpr;
        })()
      : tagExpr
    );
  }

  if (isBinaryExpr(sExpr)) {
    const expr1 = sExpr as BiOperatorExpr;
    const lexpr = await enrichExprWithSynonyms(expr1.lexpr);
    const rexpr = await enrichExprWithSynonyms(expr1.rexpr);
    return Promise.resolve({ operator: expr1.operator, lexpr, rexpr });
  } else if (isUnaryExpr(sExpr)) {
    const expr1 = sExpr as UnOperatorExpr;
    const expr = await enrichExprWithSynonyms(expr1.expr);
    return Promise.resolve({ operator: expr1.operator, expr });
  } else if (isTagExpr(sExpr)) {
    const expr1 = sExpr as TagExpr;
    return expandSynonymsToExpr(expr1);
  } else {
    throw new Error("unexpected Expression type"); 
    return Promise.resolve(sExpr);
  }
}

export async function searchAnnotations(anCol: Collection, sExpr: Sexpr): Promise<Array<anModel.AnRecord>> {
  //console.log(JSON.stringify(sExpr, null, 2));
  const withSynonymExprs = await enrichExprWithSynonyms(sExpr);
  const dbQuery = mkExprQuery(withSynonymExprs);
  //console.log(JSON.stringify(dbQuery, null, 2));
  return anCol.find(dbQuery).toArray();
}
