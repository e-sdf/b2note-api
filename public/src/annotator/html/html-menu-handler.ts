import { ImageSelectionHandler } from "../image-selection-handler";
import { HtmlAnnotationDataFactory } from "./html-annotation-data-factory";
import { Utils } from "../common/utils";
import { MenuHandler } from "../common/menu-handler";

export class HtmlMenuHandler extends MenuHandler {
  imageSelectionHandler: ImageSelectionHandler;
  annotationDataFactory: HtmlAnnotationDataFactory;

  public constructor(imageSelectionHandler: ImageSelectionHandler, annotationDataFactory: HtmlAnnotationDataFactory) {
    super();
    this.imageSelectionHandler = imageSelectionHandler;
    this.annotationDataFactory = annotationDataFactory;
  }

  protected addMenuItems(target: HTMLElement): void {
    this.addAnnotatePageMenuItem();
    this.addAnnotateSelectionMenuItem();
    this.addAnnotateLinkMenuItem(target);
    this.addAnnotateImageMenuItem(target);
    this.addAnnotateImageSelectionMenuItem();
  }

  private addAnnotatePageMenuItem(): void {
    const data = this.annotationDataFactory.getPageData();
    this.addMenuItem("Annotate page", data);
  }

  private addAnnotateSelectionMenuItem(): void {
    const selection = window.getSelection();
    if (selection?.type === "Range") {
      const data = this.annotationDataFactory.getSelectionData(selection);
      if (data) {
        this.addMenuItem("Annotate selection", data);
      }
    }
  }

  private addAnnotateLinkMenuItem(target: HTMLElement): void {
    const closestLink = Utils.findClosestLink(target);
    if (closestLink) {
      const data = this.annotationDataFactory.getLinkData(closestLink);
      this.addMenuItem("Annotate link", data);
    }
  }

  private addAnnotateImageMenuItem(target: HTMLElement): void {
    if (target.tagName == "IMG") {
      const data = this.annotationDataFactory.getImageData(target);
      this.addMenuItem("Annotate image", data);
    }
  }

  private addAnnotateImageSelectionMenuItem(): void {
    if (this.imageSelectionHandler.active && this.imageSelectionHandler.targetImage) {
      const data = this.annotationDataFactory.getImageSelectionData(this.imageSelectionHandler.targetImage, this.imageSelectionHandler.toSvg());
      this.addMenuItem("Annotate image selection", data);
    }
  }
}
