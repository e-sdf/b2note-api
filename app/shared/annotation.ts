// Types {{{1

export enum BodyItemType {
  SPECIFIC_RESOURCE = "SpecificResource",
  TEXTUAL_BODY = "TextualBody"
}

export interface AnItem {
  type: BodyItemType;
  source?: string;
  value?: string;
}

export enum PurposeType {
  TAGGING = "tagging",
  COMMENTING = "commenting"
}

export interface AnBody {
  items: Array<AnItem>;
  purpose: PurposeType;
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
  motivation: PurposeType;
  target: AnTarget;
  type: string;
}

// Record Creation {{{1

export function mkTimestamp(): string {
  return (new Date()).toISOString();
}

// Request parameters

export enum OwnerFilter {
  MINE = "mine",
  OTHERS = "others"
}

export enum TypeFilter {
  SEMANTIC = "semantic",
  KEYWORD = "keyword",
  COMMENT = "comment"
}

export interface GetQuery {
  owner?: Array<OwnerFilter>;
  type?: Array<TypeFilter>;
}

// Record Accessing {{{1

export function getLabel(anRecord: AnRecord): string {
  const item = anRecord.body.items.find((i: AnItem) => i.type === BodyItemType.TEXTUAL_BODY );
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

