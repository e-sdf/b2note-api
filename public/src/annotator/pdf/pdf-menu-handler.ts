import { PdfAnnotationDataFactory } from "./pdf-annotation-data-factory";
import { PdfController } from "./pdf-controller";
import { ImageSelectionHandler } from "../image-selection-handler";
import { MenuHandler } from "../common/menu-handler";

export class PdfMenuHandler extends MenuHandler {
  annotationDataFactory: PdfAnnotationDataFactory;
  pdfHandler: PdfController;
  imageSelectionHandler: ImageSelectionHandler;

  public constructor(pdfHandler: PdfController, imageSelectionHandler: ImageSelectionHandler, annotationDataFactory: PdfAnnotationDataFactory) {
    super();
    this.pdfHandler = pdfHandler;
    this.annotationDataFactory = annotationDataFactory;
    this.imageSelectionHandler = imageSelectionHandler;
  }

  protected addMenuItems(): void {
    this.addAnnotateDocumentMenuItem();
    this.addAnnotatePageMenuItem();
    this.addAnnotatePageSelectionMenuItem();
  }

  private addAnnotateDocumentMenuItem(): void {
    const data = this.annotationDataFactory.getDocumentData();
    this.addMenuItem("Annotate document", data);
  }

  private addAnnotatePageMenuItem(): void {
    const data = this.annotationDataFactory.getPageData(this.pdfHandler.currentPage);
    this.addMenuItem("Annotate page", data);
  }

  private addAnnotatePageSelectionMenuItem(): void {
    if (this.imageSelectionHandler.active) {
      const data = this.annotationDataFactory.getPageSelectionData(this.pdfHandler.currentPage, this.imageSelectionHandler.toSvg());
      this.addMenuItem("Annotate selection", data);
    }
  }
}
