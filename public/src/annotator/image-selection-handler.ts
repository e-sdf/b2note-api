import { Utils } from "./common/utils";

export class ImageSelectionHandler {
  imageSelection: HTMLElement | null = null;
  targetImage: HTMLElement | null = null;

  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;

  topPctg = 0;
  leftPctg = 0;
  widthPctg = 0;
  heightPctg = 0;

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

  private get minX(): number {
    return this.targetImage?.offsetLeft || 0;
  }

  private get minY(): number {
    return this.targetImage?.offsetTop || 0;
  }

  private get maxX(): number {
    if (!this.targetImage) return 0;
    return this.targetImage.offsetLeft + this.targetImage.offsetWidth;
  }

  private get maxY(): number {
    if (!this.targetImage) return 0;
    return this.targetImage.offsetTop + this.targetImage.offsetHeight;
  }

  public init(): void {
    document.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  public toSvg(): string {
    return `<svg><rect x="${this.leftPctg}%" y="${this.topPctg}%" width="${this.widthPctg}%" height="${this.heightPctg}%" /></svg>`;
  }

  private handleMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if ((target.tagName != "IMG" && target.tagName != "CANVAS") || e.buttons != 1) return;
    e.preventDefault();

    this.clearSelection();
    this.targetImage = target;

    this.startX = e.pageX;
    this.startY = e.pageY;

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

  private handleResize() {
    if (!this.active || !this.targetImage) return;

    this.resizeSelection();
  }

  private setPosition(currentX: number, currentY: number): void {
    this.currentX = Math.min(this.maxX, Math.max(this.minX, currentX));
    this.currentY = Math.min(this.maxY, Math.max(this.minY, currentY));

    this.updatePctgs();
    this.resizeSelection();
  }

  private updatePctgs() {
    this.leftPctg = this.toPctg(Math.min(this.startX, this.currentX) - this.minX, this.imageWidth);
    this.topPctg = this.toPctg(Math.min(this.startY, this.currentY) - this.minY, this.imageHeight);
    this.widthPctg = this.toPctg(Math.abs(this.currentX - this.startX), this.imageWidth);
    this.heightPctg = this.toPctg(Math.abs(this.currentY - this.startY), this.imageHeight);
  }

  private resizeSelection(): void {
    const left = this.minX + this.imageWidth * this.leftPctg * 0.01;
    const top = this.minY + this.imageHeight * this.topPctg * 0.01;
    const width = this.imageWidth * this.widthPctg * 0.01;
    const height = this.imageHeight * this.heightPctg * 0.01;
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
