import type { Collection } from "mongodb";
import { MongoClient } from "mongodb";
import config from "../config";

export type DBQuery = Record<string, any>;

export type DbOp = (col: Collection) => Promise<any>;

export function getClient(): Promise<MongoClient> {
  return MongoClient.connect(config.mongodbUrl, { useUnifiedTopology: true });
}

export function withCollection<T>(colName: string, dbOp: DbOp): Promise<T> {
  return new Promise((resolve, reject) => {
    getClient().then(
      dbClient =>  {
        const anCol = dbClient.db().collection(colName);
        return dbOp(anCol).then(
          res => dbClient.close().then(() => resolve(res)),
          err => dbClient.close().then(() => reject(err))
        );
      },
      err => reject(err)
    );
  });
}