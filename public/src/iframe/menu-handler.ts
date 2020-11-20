import { ImageSelectionHandler } from "./image-selection-handler";
import { AnnotationDataFactory } from "./annotation-data-factory";
import { Utils } from "./utils";

export class MenuHandler {
  menu: HTMLElement | null = null;
  annotatePage : boolean;
  imageSelectionHandler: ImageSelectionHandler;
  annotationDataFactory: AnnotationDataFactory;

  public constructor(imageSelectionHandler: ImageSelectionHandler, annotationDataFactory: AnnotationDataFactory, annotatePage : boolean) {
    this.annotatePage = annotatePage;
    this.imageSelectionHandler = imageSelectionHandler;
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

    this.addAnnotatePageMenuItem();
    this.addAnnotateSelectionMenuItem();
    this.addAnnotateLinkMenuItem(target);
    this.addAnnotateImageMenuItem(target);
    this.addAnnotateImageSelectionMenuItem();

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

  private addAnnotatePageMenuItem() {
    if (this.annotatePage) {
      const data = this.annotationDataFactory.getPageData();
      this.addMenuItem("Annotate page", data);
    }
  }

  private addAnnotateSelectionMenuItem() {
    const selection = window.getSelection();
    if (selection?.type === "Range") {
      const data = this.annotationDataFactory.getSelectionData(selection);
      this.addMenuItem("Annotate selection", data);
    }
  }

  private addAnnotateLinkMenuItem(target: HTMLElement) {
    const closestLink = Utils.findClosestLink(target);
    if (closestLink) {
      const data = this.annotationDataFactory.getLinkData(closestLink);
      this.addMenuItem("Annotate link", data);
    }
  }

  private addAnnotateImageMenuItem(target: HTMLElement) {
    if (target.tagName == "IMG") {
      const data = this.annotationDataFactory.getImageData(target);
      this.addMenuItem("Annotate image", data);
    }
  }

  private addAnnotateImageSelectionMenuItem() {
    if (this.imageSelectionHandler.active && this.imageSelectionHandler.targetImage) {
      const data = this.annotationDataFactory.getImageSelectionData(this.imageSelectionHandler.targetImage, this.imageSelectionHandler.toSvg());
      this.addMenuItem("Annotate image selection", data);
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
