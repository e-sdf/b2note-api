import * as EventEmitter from "events";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;

export class PdfController extends EventEmitter.EventEmitter {
  pdfDoc: any = null;
  pageRendering = false;
  pageNumPending: number | null = null;
  pageNum = 1;
  scale = 1;
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  currentPageElement: HTMLElement | null = null;

  public get currentPage(): number {
    return this.pageNum;
  }

  private get pageCount(): number {
    return this.pdfDoc.numPages;
  }

  public init(pdfDoc: any): void {
    this.pdfDoc = pdfDoc;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext("2d");

    this.currentPageElement = document.getElementById("currentPage") as HTMLElement;

    const pageCount = document.getElementById("pageCount") as HTMLElement;
    if (pageCount) {
      pageCount.textContent = `${this.pageCount}`;
    }

    this.renderPage(this.pageNum);

    document.getElementById("prev")?.addEventListener("click", this.onPrevPage.bind(this));
    document.getElementById("next")?.addEventListener("click", this.onNextPage.bind(this));
    document.getElementById("zoomIn")?.addEventListener("click", this.onZoomIn.bind(this));
    document.getElementById("zoomOut")?.addEventListener("click", this.onZoomOut.bind(this));
  }

  private renderPage(num: number): void {
    this.pageRendering = true;
    this.emit("renderPage");

    this.pdfDoc.getPage(num)
      .then((page: any) => {
        const viewport = page.getViewport({ scale: this.scale });
        this.resizeCanvas(viewport);

        const renderContext = { canvasContext: this.ctx, viewport };
        return page.render(renderContext).promise;
      })
      .then(() => {
        this.pageRendering = false;

        if (this.pageNumPending != null) {
          this.renderPage(this.pageNumPending);
          this.pageNumPending = null;
        }
      });

    if (this.currentPageElement) {
      this.currentPageElement.textContent = `${num}`;
    }
  }

  private resizeCanvas(viewport: any): void {
    if (this.canvas) {
      this.canvas.width = viewport.width;
      this.canvas.height = viewport.height;
    }
  }

  private queueRenderPage(num: number): void {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }

  private onPrevPage() {
    if (this.pageNum > 1) {
      this.pageNum--;
      this.queueRenderPage(this.pageNum);
    }
  }

  private onNextPage() {
    if (this.pageNum < this.pageCount) {
      this.pageNum++;
      this.queueRenderPage(this.pageNum);
    }
  }

  private onZoomIn() {
    this.scale = Math.min(MAX_SCALE, this.scale + SCALE_STEP);
    this.queueRenderPage(this.pageNum);
  }

  private onZoomOut() {
    this.scale = Math.max(MIN_SCALE, this.scale - SCALE_STEP);
    this.queueRenderPage(this.pageNum);
  }
}
