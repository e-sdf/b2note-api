// Types {{{1

export type BodyItemType = "SpecificResource" | "TextualBody";

export interface AnItem {
  type: BodyItemType;
  source?: string;
  value?: string;
}

export interface AnBody {
  items: Array<AnItem>;
  purpose: string;
  type: string;
}

export interface AnCreator {
  id: string;
  type: string;
  nickname: string;
}

export interface AnGenerator {
  type: string;
  homepage: string;
  name: string;
}

export interface AnTarget {
  id: string;
  source: string;
  type: string;
}

export interface AnRecord {
  "@context": string;
  body: any;
  created: string;
  creator: AnCreator;
  generated: string;
  generator: AnGenerator;
  id: string;
  motivation: string;
  target: AnTarget;
  type: string;
}

// Record Creation {{{1

export function mkTimestamp(): string {
  const twoDigits = (n: string): string => n.length === 1 ? "0" + n : n;
  const d = new Date();
  const yyyy = d.getFullYear().toString();
  const mm = twoDigits(d.getMonth().toString());
  const dd = twoDigits(d.getDate().toString());
  const hh = twoDigits(d.getHours().toString());
  const mi = twoDigits(d.getMinutes().toString());
  const ss = twoDigits(d.getSeconds().toString());
  const ms = d.getMilliseconds().toString();
  return yyyy + "-" + mm + "-" + dd +
    "T" + hh + ":" + mi + ":" + ss + "." + ms;
}

// Record Accessing {{{1

export function getLabel(anRecord: AnRecord): string {
  const item = anRecord.body.items.find((i: AnItem) => i.type === "TextualBody" as BodyItemType);
  if (!item) {
    throw new Error("TextualBody record not found in body item");
  } else {
    if (!item.value) {
      throw new Error("Value field not found in TextualBody item");
    } else {
      return item.value;
    }
  }
}

