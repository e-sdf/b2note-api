import { Utils } from "./common/utils";

export class ImageSelectionHandler {
  imageSelection: HTMLElement | null = null;
  targetImage: HTMLElement | null = null;
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;

  mouseMoveListener: any;
  mouseUpListener: any;

  public get active(): boolean {
    return this.imageSelection != null;
  }

  private get imageWidth(): number {
    return this.maxX - this.minX;
  }

  private get imageHeight(): number {
    return this.maxY - this.minY;
  }

  public init(): void {
    document.addEventListener("mousedown", this.handleMouseDown.bind(this));
  }

  public toSvg(): string {
    const x = this.toPctg(Math.min(this.startX, this.currentX) - this.minX, this.imageWidth);
    const y = this.toPctg(Math.min(this.startY, this.currentY) - this.minY, this.imageHeight);
    const width = this.toPctg(Math.abs(this.currentX - this.startX), this.imageWidth);
    const height = this.toPctg(Math.abs(this.currentY - this.startY), this.imageHeight);
    return `<svg><rect x="${x}%" y="${y}%" width="${width}%" height="${height}%" /></svg>`;
  }

  private handleMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if ((target.tagName != "IMG" && target.tagName != "CANVAS") || e.buttons != 1) return;
    e.preventDefault();

    this.clearSelection();
    this.targetImage = target;

    this.startX = e.pageX;
    this.startY = e.pageY;
    this.minX = target.offsetLeft;
    this.minY = target.offsetTop;
    this.maxX = target.offsetLeft + target.offsetWidth;
    this.maxY = target.offsetTop + target.offsetHeight;

    this.imageSelection = Utils.addElement("b2note-annotator-selection");
    this.setPosition(this.startX, this.startY);

    this.mouseMoveListener = this.handleMouseMove.bind(this);
    this.mouseUpListener = this.handleMouseUp.bind(this);
    document.addEventListener("mousemove", this.mouseMoveListener);
    document.addEventListener("mouseup", this.mouseUpListener);
  }

  private handleMouseMove(e: MouseEvent) {
    e.preventDefault();
    this.setPosition(e.pageX, e.pageY);
  }

  private handleMouseUp(e: MouseEvent) {
    e.preventDefault();
    document.removeEventListener("mousemove", this.mouseMoveListener);
    document.removeEventListener("mouseup", this.mouseUpListener);

    if (this.startX == this.currentX || this.startY == this.currentY) {
      this.clearSelection();
    }
  }

  private setPosition(currentX: number, currentY: number): void {
    this.currentX = Math.min(this.maxX, Math.max(this.minX, currentX));
    this.currentY = Math.min(this.maxY, Math.max(this.minY, currentY));
    const left = Math.min(this.startX, this.currentX);
    const top = Math.min(this.startY, this.currentY);
    const width = Math.abs(this.startX - this.currentX);
    const height = Math.abs(this.startY - this.currentY);

    this.imageSelection?.setAttribute("style", `top: ${top}px; left: ${left}px; height: ${height}px; width: ${width}px`);
  }

  public clearSelection(): void {
    if (this.imageSelection) {
      this.imageSelection.outerHTML = "";
      this.imageSelection = null;
    }

    if (this.targetImage) {
      this.targetImage = null;
    }
  }

  private toPctg(num: number, base: number): number {
    return Math.round(10000 * num / base + Number.EPSILON) / 100;
  }
}
