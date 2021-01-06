import { AnnotationDataFactory } from "../common/annotation-data-factory";
import { TableRangeType } from "../../../../app/core/annotationsModel";
import { TargetInput, TargetInputType } from "../../../../app/core/targetInput";

export class TableAnnotationDataFactory extends AnnotationDataFactory {
  getPageData(): TargetInput {
    return {
      type: TargetInputType.PAGE,
      pid: this.baseUrl,
    };
  }

  getSheetData(sheet: string): TargetInput {
    return {
      type: TargetInputType.TABLE,
      pid: this.baseUrl,
      sheet
    };
  }

  getCellData(sheet: string, col: number, row: number): TargetInput {
    return {
      type: TargetInputType.TABLE,
      pid: this.baseUrl,
      sheet,
      range: {
        type: TableRangeType.CELLS,
        startColumn: col,
        endColumn: col,
        startRow: row,
        endRow: row
      }
    };
  }

  getRowData(sheet: string, row: number): TargetInput {
    return {
      type: TargetType.TABLE,
      pid: this.baseUrl,
      sheet,
      range: {
        type: "RowRange",
        startRow: row,
        endRow: row
      }
    };
  }

  getColData(sheet: string, col: number): TargetInput {
    return {
      type: TargetType.TABLE,
      pid: this.baseUrl,
      sheet,
      range: {
        type: "ColumnRange",
        startColumn: col,
        endColumn: col
      }
    };
  }
}
