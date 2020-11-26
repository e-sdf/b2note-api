import { AnnotationDataFactory } from "../common/annotation-data-factory";
import { TargetInput, TargetType } from "../../../../app/core/targetInput";

export class TableAnnotationDataFactory extends AnnotationDataFactory {
  getPageData(): TargetInput {
    return {
      type: TargetType.PAGE,
      pid: this.baseUrl,
    };
  }

  getSheetData(sheet: string): TargetInput {
    return {
      type: TargetType.TABLE,
      pid: this.baseUrl,
      sheet
    };
  }

  getCellData(sheet: string, col: number, row: number): TargetInput {
    return {
      type: TargetType.TABLE,
      pid: this.baseUrl,
      sheet,
      range: {
        type: "CellRange",
        startColumn: col,
        endColumn: col,
        startRow: row,
        endRow: row
      }
    };
  }
}
