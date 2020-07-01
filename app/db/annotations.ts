import _ from "lodash";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import type { Collection } from "mongodb";
import * as dbClient from "./client";
import type { DBQuery } from "./client";
import config from "../config";
import * as anModel from "../core/annotationsModel";
import { genUuid } from "./uuid";
import type { TagExpr, Sexpr } from "../core/searchModel";
import { SearchType, BiOperatorExpr, BiOperatorType, UnOperatorExpr, UnOperatorType, isBinaryExpr, isUnaryExpr, isTagExpr } from "../core/searchModel";
import type { OntologyDict, OntologyInfo } from "../core/ontologyRegister";
import { getOntologies } from "../core/ontologyRegister";

// Definitions {{{1

// DB Access {{{1

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("annotations", dbOp);
}

// Filters {{{1

function mkTypeFilter(query: anModel.GetQuery): DBQuery {
  const semanticFilter = query["type"]?.includes(anModel.AnnotationType.SEMANTIC) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.COMPOSITE
  } : {};
  const keywordFilter = query["type"]?.includes(anModel.AnnotationType.KEYWORD) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY 
  } : {};
  const commentFilter = query["type"]?.includes(anModel.AnnotationType.COMMENT) ? { 
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

function findAnnotationsOfTarget(anCol: Collection, id: string, source: string): Promise<Array<anModel.Annotation>> {
  const query = { "target.id": id, "target.source": source };
  return anCol.find(query).toArray();
}

export async function getSemanticAnnotation(anCol: Collection, tag: string): Promise<anModel.Annotation|null> {
  const res = await anCol.find({ "body.items": { "$elemMatch": { value: tag } } }).toArray();
  return res[0];
}

export function getAnnotationsForTag(value: string): Promise<Array<anModel.Annotation>> {
  const query = {
    "$or": [
      { "body.value": value },
      { "body.items": { "$elemMatch": { value } } }
    ]
  };
  return withCollection(
    anCol => anCol.find(query).toArray()
  );
}

// DB API {{{1

// Reading {{{2

export function getAnnotation(anId: string): Promise<anModel.Annotation|null> {
  return withCollection(
    anCol => anCol.findOne({ id: anId })
  );
}

function sort(ans: Array<anModel.Annotation>): Array<anModel.Annotation> {
  return _.sortBy(ans, (a) => anModel.getLabel(a).toLocaleLowerCase());
}

export function getAnnotations(query: anModel.GetQuery): Promise<Array<anModel.Annotation>> {
  const filter = {
    ...mkTypeFilter(query),
    ...mkCreatorFilter(query),
    ...mkTargetSourceFilter(query),
    ...mkValueFilter(query)
  };
  const dbQuery = isEmptyFilter(filter) ? {} : filter;
  const skipNo = query.skip;
  const limitNo = query.limit;
  return withCollection(
    anCol => new Promise((resolve, reject) => {
      const anlPm = 
        skipNo && limitNo ?
          anCol.find(dbQuery).skip(skipNo).limit(limitNo).toArray()
        : skipNo ? anCol.find(dbQuery).skip(skipNo).toArray()
        : limitNo ? anCol.find(dbQuery).limit(limitNo).toArray()
        : anCol.find(dbQuery).toArray();
      anlPm.then(
        (anl: Array<anModel.Annotation>) => {
          const sorted = sort(anl);
          resolve(sorted);
        },
        err => reject(err)
      );
    })
  );
}

// Modifying {{{2

export function addAnnotation(annotation: anModel.Annotation): Promise<anModel.Annotation|null> {
  return withCollection(
    anCol => new Promise((resolve, reject) => {
      findAnnotationsOfTarget(anCol, annotation.target.id, annotation.target.source).then(
        annotations => {
          const existing = annotations.find((an: anModel.Annotation) => anModel.isEqual(annotation, an));
          if (existing) {
            resolve(null);
          } else {
            const anRecord: anModel.Annotation = {
              ...annotation,
              visibility: annotation.visibility || anModel.VisibilityEnum.PRIVATE
            };
            anCol.insertOne(anRecord).then(
              res => {
                const newId = res.insertedId as string;
                genUuid().then(
                  uuid => {
                    anCol.findOneAndUpdate(
                      { _id: newId },
                      { "$set": { id: uuid } },
                      { returnOriginal: false }
                    ).then(
                      newAn => resolve(newAn.value),
                      err => reject(err)
                    );
                  }
                );
              }
            );
          }
        }
      );
    })
  );
}

export function updateAnnotation(anId: string, changes: Partial<anModel.Annotation>): Promise<number> {
  return withCollection(
    anCol => new Promise((resolve, reject) => {
      anCol.updateOne({ id: anId }, { "$set": changes }).then(
        res => resolve(res.matchedCount),
        err => reject(err)
      );
    })
  );
}

export function deleteAnnotation(anId: string): Promise<number> {
  return withCollection(
    anCol => new Promise((resolve) => {
      anCol.deleteOne({ id: anId }).then(
        res => resolve(res.result.n || 0),
        err => resolve(0)
      );
    })
  );
}

// Searching {{{2

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
    "body.value": { "$regex": value, "$options": "i" }
  };
}

function mkRegexDBQuery(regex: string): DBQuery {
  return {
    "$or": [
      { "body.value": { "$regex": regex, "$options": "i" } },
      { "body.items": { "$elemMatch": { value: { "$regex": regex, "$options": "i" } } } }
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
          const ontologiesDict: OntologyDict = await getOntologies(config.solrUrl, tagExpr.value);
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

export function searchAnnotations(sExpr: Sexpr): Promise<Array<anModel.Annotation>> {
  return withCollection(
    anCol => new Promise((resolve, reject) => {
      // console.log(JSON.stringify(sExpr, null, 2));
      enrichExprWithSynonyms(sExpr).then(
        withSynonymExprs => {
          // console.log(JSON.stringify(withSynonymExprs, null, 2));
          const dbQuery = mkExprDBQuery(withSynonymExprs);
          // console.log(JSON.stringify(dbQuery, null, 2));
          resolve(anCol.find(dbQuery).collation({ locale: "en", strength: 2 }).toArray());
        },
        err => reject(err)
      );
    })
  );
}