import { TypeFilter } from "./annotationsModel";

export const searchUrl = "/search";

export enum OperatorType { AND = "AND", OR = "OR", AND_NOT = "AND_NOT", XOR = "XOR" }

export interface SearchTerm {
  operator?: OperatorType;
  type: TypeFilter;
  label: string;
}

export interface SearchQuery {
  terms: Array<SearchTerm>;
  includeSynonyms: boolean;
}
