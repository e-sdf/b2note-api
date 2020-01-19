import { MongoClient } from "mongodb";
import config from "../config";

export type DBQuery = Record<string, any>;

export async function getClient(): Promise<MongoClient> {
  return MongoClient.connect(config.mongodbUrl, { useUnifiedTopology: true });
}