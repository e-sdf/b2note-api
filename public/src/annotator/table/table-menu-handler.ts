import { TableAnnotationDataFactory } from "./table-annotation-data-factory";
import { TableController } from "./table-controller";
import { MenuHandler } from "../common/menu-handler";

export class TableMenuHandler extends MenuHandler {
  menu: HTMLElement | null = null;
  annotationDataFactory: TableAnnotationDataFactory;
  tableHandler: TableController;

  public constructor(tableHandler: TableController, annotationDataFactory: TableAnnotationDataFactory) {
    super();
    this.tableHandler = tableHandler;
    this.annotationDataFactory = annotationDataFactory;
  }

  protected addMenuItems(target: HTMLElement): void {
    this.addAnnotateDocumentMenuItem();
    this.addAnnotateSheetMenuItem();
    this.addAnnotateCellMenuItem(target);
  }

  private addAnnotateDocumentMenuItem(): void {
    const data = this.annotationDataFactory.getPageData();
    this.addMenuItem("Annotate document", data);
  }

  private addAnnotateSheetMenuItem(): void {
    const data = this.annotationDataFactory.getSheetData(this.tableHandler.selectedSheet);
    this.addMenuItem("Annotate sheet", data);
  }

  private addAnnotateCellMenuItem(target: HTMLElement): void {
    if (target.dataset.col && target.dataset.row) {
      const col = parseInt(target.dataset.col);
      const row = parseInt(target.dataset.row);
      const data = this.annotationDataFactory.getCellData(this.tableHandler.selectedSheet, col, row);
      this.addMenuItem("Annotate cell", data);
    }
  }
}
