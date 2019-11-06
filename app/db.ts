import * as _ from "lodash";
import { MongoClient, Collection, InsertOneWriteOpResult } from "mongodb";
import config from "./config";
import * as an from "./shared/annotation";

const colName = "annotations";

// Database routines {{{1
export async function getClient(): Promise<MongoClient> {
  return MongoClient.connect(config.mongodbUrl);
}

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db(config.dbName).collection(colName);
}

export function getAnnotations(anCol: Collection): Promise<Array<an.AnRecord>> {
  return anCol.find().toArray();
}

export async function findAnnotationsOfTarget(anCol: Collection, id: string, source: string): Promise<any> {
  const query = { "target.id": id, "target.source": source };
  const res = await anCol.find(query);
  return res.toArray();
}

export async function addAnnotation(annotation: an.AnRecord): Promise<string|null> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const annotations = await findAnnotationsOfTarget(anCol, annotation.target.id, annotation.target.source);
  const existing = annotations.find((an: an.AnRecord) => _.isEqual(an.body.items, annotation.body.items));
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

