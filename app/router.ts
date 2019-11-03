import * as _ from "lodash";
import { Request, Response, Router } from "express";
import * as express from "express";
import { MongoClient, Db, Collection, InsertOneWriteOpResult } from "mongodb";
import * as responses from "./responses";
import config from "./config";
import * as an from "./shared/annotation";

var router = Router();

const colName = "annotations";

// Database routines {{{1
async function getDbClient(resp: Response): Promise<MongoClient> {
  return MongoClient.connect(config.mongodbUrl);
}

function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db(config.dbName).collection(colName);
}

async function findAnnotationsOfTarget(anCol: Collection, id: string, source: string): Promise<any> {
  const query = { "target.id": id, "target.source": source };
  const res = await anCol.find(query);
  return res.toArray();
}

async function addAnnotation(resp: Response, annotation: an.AnRecord): Promise<InsertOneWriteOpResult<any> | null> {
  const dbClient = await getDbClient(resp);
  const anCol = getCollection(dbClient);
  const annotations = await findAnnotationsOfTarget(anCol, annotation.target.id, annotation.target.source);
  const existing = annotations.find((an: an.AnRecord) => _.isEqual(an.body.items, annotation.body.items));
  if (existing) {
    await dbClient.close();
    return null;
  } else {
    const res = anCol.insertOne(annotation);
    await dbClient.close();
    return res;
  }
}

// Response creation {{{1

function mkResponse(id: string) {
  const ts = an.mkTimestamp();
  return {
    _updated: ts,
    _created: ts,
    _id: id,
    _links: {
      self: {
	title: "Annotation",
	href: "annotations/" + id
      }
    },
    "_status": "OK"
  };
}

// Handlers {{{1

// Create a new annotation 
router.post("/annotations", (req: Request, resp: Response) => {
  const annotation = req.body as an.AnRecord;
  addAnnotation(resp, annotation).then(
    res => {
      if (res) { // annotation saved
	responses.created(resp, mkResponse(res.insertedId));
      } else { // annotation already exists
        responses.forbidden(resp, { message: "Annotation already exists" });
      }
    }
  ).catch(
    err => responses.serverErr(resp, err, "Internal server error")
  );
});

export default router;
