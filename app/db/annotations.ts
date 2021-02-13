import _ from "lodash";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import type { Collection } from "mongodb";
import * as dbClient from "./client";
import type { DBQuery } from "./client";
import type { UserProfile } from "../core/user";
import * as anModel from "../core/annotationsModel";
import * as qModel from "../core/apiModels/anQueryModel";
import type { TagExpr, Sexpr } from "../core/searchModel";
import { SearchType, BiOperatorExpr, BiOperatorType, UnOperatorExpr, UnOperatorType, isBinaryExpr, isUnaryExpr, isTagExpr } from "../core/searchModel";
import type { OTermsDict, OntologyTerm } from "../core/ontologyRegister";
import { getOTerm } from "./ontologyRegister";
import { logError } from "../logging";
import { addItem, deleteItem } from "./utils";

// Definitions {{{1

// DB Access {{{1

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("annotations", dbOp);
}

// Filters {{{1

function mkPrivateFilter(mbUser: UserProfile|null): DBQuery {
  return (
    mbUser ?
      mbUser.admin ?
        {}
      :
        {
          "$or": [
            { visibility: "public" },
            { "$and": [ { visibility: "private" }, { "creator.id": mbUser.id }]}
          ]
        }
    : { visibility: "public" }
  );
}

function mkTypeFilter(query: qModel.GetAnQuery): DBQuery {
  const semanticFilter = query["type"]?.includes(anModel.AnBodyType.SEMANTIC) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.COMPOSITE
  } : {};
  const keywordFilter = query["type"]?.includes(anModel.AnBodyType.KEYWORD) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY
  } : {};
  const commentFilter = query["type"]?.includes(anModel.AnBodyType.COMMENT) ? {
    motivation: anModel.PurposeType.COMMENTING ,
    "body.type": anModel.AnBodyItemType.TEXTUAL_BODY
  } : {};
  const tripleFilter = query["type"]?.includes(anModel.AnBodyType.TRIPLE) ? {
    motivation: anModel.PurposeType.TAGGING,
    "body.type": anModel.AnBodyItemType.SPECIFIC_RESOURCE
  } : {};
  const typeFilters = [{...semanticFilter}, {...keywordFilter}, {...commentFilter}, {...tripleFilter}].filter(i => { return !_.isEmpty(i); });
  const filter = typeFilters.length > 0 ? { "$or": typeFilters} : {};
  return filter;
}

function mkCreatorFilter(query: qModel.GetAnQuery): DBQuery {
  return query.creator ? { "creator.id": query.creator } : {};
}

function mkTargetIdFilter(query: qModel.GetAnQuery): DBQuery {
  const ff = query["target-id"];
  return (
    ff && ff.length > 0 ?
      { "$or": ff.map(tid => ({ "target.id": tid })) }
    : { }
  );
}

function mkTargetSourceFilter(query: qModel.GetAnQuery): DBQuery {
  const ff = query["target-source"];
  return (
    ff && ff.length > 0 ? { "target.source": { "$in": ff } } : { }
  );
}

function mkValueFilter(query: qModel.GetAnQuery): DBQuery {
  return query.value ? { "$or": [
    { "body.value": query.value }, // keyword and comment
    { "body.items": { "$elemMatch": { value: query.value } } } // semantic
  ] }
  : {};
}

function mkCatalogFilter(query: qModel.GetAnQuery): DBQuery {
  const c = query.catalog;
  return (
    c ? { "catalogs": c } : { }
  );
}

// Queries {{{1

export function getAnnotationById(anCol: Collection, anId: string): Promise<anModel.Annotation|null> {
  return new Promise((resolve, reject) => {
    const query = { id: anId };
    anCol.find(query).toArray().then(
      res => {
        if (res.length === 0) {
          resolve(null);
        } else if (res.length > 1) {
          logError("Duplicate annotation id: " + anId);
          reject("Duplicate annotation id: " + anId);
        } else {
          resolve(res[0]);
        }
      }
    );
  });
}

function findAnnotationsOfTarget(anCol: Collection, target: anModel.AnTarget): Promise<Array<anModel.Annotation>> {
  const query = {
    "target.id": target.id,
    "$or": [ { "target.source": target.source }, { "target.selector": target.selector } ]
  };
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

function sort(ans: Array<anModel.Annotation>): Array<anModel.Annotation> {
  return _.sortBy(ans, (a) => anModel.getLabel(a).toLocaleLowerCase());
}

export function getAnnotation(anId: string): Promise<anModel.Annotation|null> {
  return withCollection(
    anCol => getAnnotationById(anCol, anId)
  );
}

export function getAnnotationsRecords(): Promise<Array<anModel.Annotation>> {
  return withCollection(
    anCol => anCol.find().toArray()
  );
}

export function getAnnotations(mbUser: UserProfile|null, query: qModel.GetAnQuery): Promise<Array<anModel.Annotation>> {
  const filters = [
      mkPrivateFilter(mbUser),
      mkTypeFilter(query),
      mkCreatorFilter(query),
      mkTargetIdFilter(query),
      mkTargetSourceFilter(query),
      mkValueFilter(query),
      mkCatalogFilter(query)
    ].filter(f => !_.isEmpty(f));
  const dbQuery = filters.length > 0 ?
    {
      "$and": filters
    }
  : {};
  // console.log(JSON.stringify(dbQuery, null, 2));
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
      findAnnotationsOfTarget(anCol, annotation.target).then(
        annotations => {
          const existing = annotations.find((an: anModel.Annotation) => anModel.isEqual(annotation, an));
          if (existing) {
            resolve(null);
          } else {
            const anRecord: anModel.Annotation = {
              ...annotation,
              visibility: annotation.visibility || anModel.VisibilityEnum.PRIVATE
            };
            addItem(anCol, anRecord).then(
              newAn => resolve(newAn),
              err => reject(err)
            );
          }
        }
      );
    })
  );
}

export function updateAnnotation(anId: string, changes: Partial<anModel.Annotation>): Promise<number> {
  return withCollection(
    anCol => new Promise((resolve, reject) =>
       getAnnotationById(anCol, anId).then(
         annotation => {
           if (annotation) {
             const updatedAn = {...annotation, ...changes};
             getAnnotationsForTag(anModel.getLabel(updatedAn)).then(
               sameTagAns => {
                 const existing = sameTagAns.find((an: anModel.Annotation) => annotation.id !== an.id && anModel.isEqual(updatedAn, an));
                 if (existing) {
                   reject("Same annotation would exist");
                 } else {
                   anCol.updateOne({ id: anId }, { "$set": changes }).then(
                     res => resolve(res.matchedCount),
                     err => reject(err)
                   );
                 }
               }
             );
           } else {
             reject(`Annotation id=${anId} does not exist`);
           }
         },
         err => reject(err)
       )
     )
  );
}

export function deleteAnnotation(anId: string): Promise<number> {
  return withCollection(
    anCol => deleteItem(anCol, anId)
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
          const ontologiesDict: OTermsDict = await getOTerm(tagExpr.value);
          const ontologies = ontologiesDict[tagExpr.value.toLocaleLowerCase()];
          const synonyms = ontologies.reduce(
            (acc: Array<string>, o: OntologyTerm) => [ ...acc,  ...o.synonyms  ],
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

export function searchAnnotations(mbUser: UserProfile|null, sExpr: Sexpr, catalog?: string): Promise<Array<anModel.Annotation>> {
  return withCollection(
    anCol => new Promise((resolve, reject) => {
      // console.log(JSON.stringify(sExpr, null, 2));
      enrichExprWithSynonyms(sExpr).then(
        withSynonymExprs => {
          // console.log(JSON.stringify(withSynonymExprs, null, 2));
          const filters = [
            mkExprDBQuery(withSynonymExprs),
            mkPrivateFilter(mbUser),
            mkCatalogFilter({ catalog })
          ].filter(f => !_.isEmpty(f));
          const dbQuery = filters.length > 0 ?
            {
              "$and": filters
            }
          : {};
          // console.log(JSON.stringify(dbQuery, null, 2));
          resolve(anCol.find(dbQuery).collation({ locale: "en", strength: 2 }).toArray());
        },
        err => reject(err)
      );
    })
  );
}