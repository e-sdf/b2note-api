import { ImageSelectionHandler } from "../image-selection-handler";
import { MenuHandler } from "../common/menu-handler";
import { ImageAnnotationDataFactory } from "./image-annotation-data-factory";

export class ImageMenuHandler extends MenuHandler {
  imageSelectionHandler: ImageSelectionHandler;
  annotationDataFactory: ImageAnnotationDataFactory;

  public constructor(imageSelectionHandler: ImageSelectionHandler, annotationDataFactory: ImageAnnotationDataFactory) {
    super();
    this.imageSelectionHandler = imageSelectionHandler;
    this.annotationDataFactory = annotationDataFactory;
  }

  protected addMenuItems(): void {
    this.addAnnotateImageMenuItem();
    this.addAnnotateImageSelectionMenuItem();
  }

  private addAnnotateImageMenuItem(): void {
    const data = this.annotationDataFactory.getImageData();
    this.addMenuItem("Annotate image", data);
  }

  private addAnnotateImageSelectionMenuItem(): void {
    if (this.imageSelectionHandler.active && this.imageSelectionHandler.targetImage) {
      const data = this.annotationDataFactory.getImageSelectionData(this.imageSelectionHandler.toSvg());
      this.addMenuItem("Annotate image selection", data);
    }
  }
}
