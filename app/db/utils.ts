import type { Collection } from "mongodb";
import { genUuid } from "./uuid";

function addIdPm<T>(col: Collection, dbId: string): Promise<T> {
  return new Promise((resolve, reject) =>
    genUuid().then(
      uuid => {
        col.findOneAndUpdate(
          { _id: dbId },
          { "$set": { id: uuid } },
          { returnOriginal: false }
        ).then(
          item => resolve(item.value),
          err => reject(err)
        );
      }
    )
  );
}

export function addItem<T>(col: Collection, item: T): Promise<T> {
  return new Promise((resolve, reject) =>
    col.insertOne(item).then(
      res => {
        const newId = res.insertedId as string;
        addIdPm(col, newId).then(
          newItem => resolve(newItem as T),
          err => reject(err)
        );
      }
    )
  );
}


export function deleteItem(col: Collection, id: string): Promise<number> {
  return new Promise(resolve =>
    col.deleteOne({ id }).then(
      res => resolve(res.result.n || 0),
      err => resolve(0)
    )
  );
}
