export class TableAnnotationDataFactory {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getPageData(): Record<string, unknown> {
    return {
      pid_tofeed: this.baseUrl,
    };
  }

  getSheetData(sheet: string): Record<string, unknown> {
    return {
      ...this.getPageData(),
      tableSelector_tofeed: JSON.stringify({ sheet })
    };
  }

  getCellData(sheet: string, col: number, row: number): Record<string, unknown> {
    return {
      ...this.getPageData(),
      tableSelector_tofeed: JSON.stringify({
        sheet,
        range: {
          start: { col, row },
          end: { col, row }
        }
      })
    };
  }
}
