import _ from "lodash";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import type { MongoClient, Collection } from "mongodb";
import { ObjectId } from "mongodb";
import type { DBQuery } from "./client";
import { getClient } from "./client";
import { endpointUrl, apiUrl } from "../core/server";
import * as anModel from "../core/annotationsModel";
import type { TagExpr, Sexpr } from "../core/searchModel";
import { SearchType, BiOperatorExpr, BiOperatorType, UnOperatorExpr, UnOperatorType, isBinaryExpr, isUnaryExpr, isTagExpr } from "../core/searchModel";
import type { OntologyDict, OntologyInfo } from "../core/ontologyRegister";
import { getOntologies } from "../core/ontologyRegister";

// DB Access {{{1

export { getClient } from "./client";

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db().collection("annotations");
}

// Filters {{{1

function mkTypeFilter(query: anModel.GetQuery): DBQuery {
  const semanticFilter = query["type"]?.includes(anModel.AnRecordType.SEMANTIC) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.COMPOSITE
  } : {};
  const keywordFilter = query["type"]?.includes(anModel.AnRecordType.KEYWORD) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY 
  } : {};
  const commentFilter = query["type"]?.includes(anModel.AnRecordType.COMMENT) ? { 
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

export function getAnnotation(anCol: Collection, anId: string): Promise<anModel.AnRecord|null> {
  try {
    const _id = new ObjectId(anId);
    return anCol.findOne({ _id });
  } catch(error) { 
    return Promise.resolve(null);
  }
}

function sort(ans: Array<anModel.AnRecord>): Array<anModel.AnRecord> {
  return _.sortBy(ans, (a) => anModel.getLabel(a).toLocaleLowerCase());
}
    
export async function getAnnotations(anCol: Collection, query: anModel.GetQuery): Promise<Array<anModel.AnRecord>> {
  const filter = {
    ...mkTypeFilter(query),
    ...mkCreatorFilter(query),
    ...mkTargetSourceFilter(query),
    ...mkValueFilter(query)
  };
  const dbQuery = isEmptyFilter(filter) ? {} : filter;
  const anl = await anCol.find(dbQuery).toArray();
  const res = sort(_.uniqBy(anl, (a: anModel.AnRecord) => anModel.getLabel(a)));
  return res;
}

export async function addAnnotation(annotation: anModel.AnRecord): Promise<anModel.AnRecord|null> {
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
    const newAn = await anCol.findOneAndUpdate(
      { _id: newId },
      { "$set": { id: endpointUrl + apiUrl + anModel.annotationsUrl + "/" + newId } },
      { returnOriginal: false }
    );  
    await dbClient.close();
    return newAn.value;
  }
}

export async function updateAnnotation(anId: string, changes: Record<keyof anModel.AnRecord, string>): Promise<number> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const res = await anCol.updateOne({ _id: new ObjectId(anId) }, { "$set": changes });
  await dbClient.close();
  return Promise.resolve(res.matchedCount);
}

export async function deleteAnnotation(anId: string): Promise<number> {
  try {
    const _id = new ObjectId(anId);
    const dbClient = await getClient();
    const anCol = getCollection(dbClient);
    const res = await anCol.deleteOne({ _id });
    await dbClient.close();
    return Promise.resolve(res.result.n || 0);
  } catch(error) { 
    return Promise.resolve(0);
  }
}

// Searching {{{1

function mkSemanticDBQuery(value: string): DBQuery {
  return {
    "body.type": anModel.AnBodyItemType.COMPOSITE,
    // "body.items": { "$elemMatch": { "$regex": value, "$options": "i" } }
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
      { "body.value": { "$regex": regex, "$options": "i" } },
      { "body.items": { "$elemMatch": { "$regex": regex, "$options": "i" } } }
    ]
  };
}

function mkTagDBQuery(tagExpr: TagExpr): DBQuery {
  //console.log(tagExpr);
  const val = tagExpr.value;
  return matchSwitch(tagExpr.type, {
    [SearchType.SEMANTIC]: () => mkSemanticDBQuery(val),
    [SearchType.KEYWORD]: () => mkKeywordDBQuery(val),
    [SearchType.COMMENT]: () => mkCommentDBQuery(val),
    [SearchType.REGEX]: () => mkRegexDBQuery(val)
  });
}

function mkUnaryDBQuery(unExpr: UnOperatorExpr): DBQuery {
  if (unExpr.operator !== UnOperatorType.NOT) { throw new Error("Just NOT unary operator implemented"); }
  return {
    "$not": mkExprDBQuery(unExpr.expr)
  };
}

function mkBinaryDBQuery(biExpr: BiOperatorExpr): DBQuery {

  function mkOperator(operator: BiOperatorType): string {
    return matchSwitch(operator, {
      [BiOperatorType.AND]: () => "$and",
      [BiOperatorType.OR]: () => "$or",
      [BiOperatorType.XOR]: () => "$xor"
    });
  }

  return {
    [mkOperator(biExpr.operator)]: [ mkExprDBQuery(biExpr.lexpr), mkExprDBQuery(biExpr.rexpr)]
  };
}

function mkExprDBQuery(sExpr: Sexpr): DBQuery {
  return (
      isTagExpr(sExpr) ? mkTagDBQuery(sExpr as TagExpr)
    : isUnaryExpr(sExpr) ? mkUnaryDBQuery(sExpr as UnOperatorExpr)
    : mkBinaryDBQuery(sExpr as BiOperatorExpr)
  );
}

async function enrichExprWithSynonyms(sExpr: Sexpr): Promise<Sexpr> {
  
  function mkMultiAndExpr(tags: Array<string>): Sexpr {
    if (tags.length === 0) { throw new Error("empty tags array"); }
    return (
      tags.length === 1 ?
        ({ type: SearchType.SEMANTIC, value: tags[0] } as TagExpr)
      : ({ 
        operator: BiOperatorType.OR,
        lexpr: mkMultiAndExpr([tags[0]]),
        rexpr: mkMultiAndExpr(_.tail(tags))
      } as BiOperatorExpr)
    );
  }

  async function expandSynonymsToExpr(tagExpr: TagExpr): Promise<Sexpr> {
    return (
      tagExpr.synonymsFlag ?
        (async () => {
          const ontologiesDict: OntologyDict = await getOntologies(tagExpr.value);
          const ontologies = ontologiesDict[tagExpr.value.toLocaleLowerCase()];
          const synonyms = ontologies.reduce(
            (acc: Array<string>, o: OntologyInfo) => [ ...acc,  ...o.synonyms  ],
            []
          );
          return mkMultiAndExpr([ tagExpr.value, ...synonyms ]);
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
  // console.log(JSON.stringify(sExpr, null, 2));
  const withSynonymExprs = await enrichExprWithSynonyms(sExpr);
  // console.log(JSON.stringify(withSynonymExprs, null, 2));
  const dbQuery = mkExprDBQuery(withSynonymExprs);
  // console.log(JSON.stringify(dbQuery, null, 2));
  return anCol.find(dbQuery).collation({ locale: "en", strength: 2 }).toArray();
}