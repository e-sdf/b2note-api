import { Utils } from "./utils";
import { TableAnnotationDataFactory } from "./table-annotation-data-factory";
import { TableHandler } from "./table-handler";

export class TableMenuHandler {
  menu: HTMLElement | null = null;
  annotationDataFactory: TableAnnotationDataFactory;
  tableHandler: TableHandler

  public constructor(tableHandler: TableHandler, annotationDataFactory: TableAnnotationDataFactory) {
    this.tableHandler = tableHandler;
    this.annotationDataFactory = annotationDataFactory;
  }

  public init(): void {
    document.addEventListener("contextmenu", this.handleContextMenu.bind(this));
  }

  private get isOpen(): boolean {
    return this.menu != null;
  }

  private handleContextMenu(e: MouseEvent) {
    e.preventDefault();

    if (this.isOpen) return;

    const target = e.target as HTMLElement;
    this.menu = Utils.addElement("b2note-annotator-menu");

    this.addAnnotateDocumentMenuItem();
    this.addAnnotateSheetMenuItem();
    this.addAnnotateCellMenuItem(target);

    this.menu.onmouseleave = this.close.bind(this);
    this.setMenuPosition(e);
  }

  private setMenuPosition(e: MouseEvent) {
    const width = this.menu?.offsetWidth || 0;
    const height = this.menu?.offsetHeight || 0;
    const x = Math.max(0, Math.min(e.pageX - 5, document.body.clientWidth - width));
    const y = Math.max(0, Math.min(e.pageY - 5, document.body.clientHeight - height));
    this.menu?.setAttribute("style", `top: ${y}px; left: ${x}px;`);
  }

  private close() {
    if (this.menu != null) {
      this.menu.classList.add("hidden");

      setTimeout(() => {
        if (this.menu != null) {
          this.menu.outerHTML = "";
          this.menu = null;
        }
      }, 250);
    }
  }

  private addAnnotateDocumentMenuItem() {
      const data = this.annotationDataFactory.getPageData();
      this.addMenuItem("Annotate document", data);
  }

  private addAnnotateSheetMenuItem() {
    const data = this.annotationDataFactory.getSheetData(this.tableHandler.selectedSheet);
    this.addMenuItem("Annotate sheet", data);
  }

  private addAnnotateCellMenuItem(target: HTMLElement) {
    if (target.dataset.col && target.dataset.row) {
      const col = parseInt(target.dataset.col);
      const row = parseInt(target.dataset.row);
      const data = this.annotationDataFactory.getCellData(this.tableHandler.selectedSheet, col, row);
      this.addMenuItem("Annotate cell", data);
    }
  }

  private addMenuItem(text: string, data: Record<string, unknown> = {}): void {
    const item = document.createElement("div") as HTMLElement;
    item.innerText = text;
    item.onclick = () => {
      Utils.postMessage("iframe.annotate", { data });
      this.close();
    };
    this.menu?.appendChild(item);
  }
}
