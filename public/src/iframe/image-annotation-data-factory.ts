import { AnnotationDataFactory } from "./annotation-data-factory";

export class ImageAnnotationDataFactory extends AnnotationDataFactory {
  getImageData(image: HTMLElement): Record<string, unknown> {
    return {
      pid_tofeed: this.baseUrl,
    };
  }

  getImageSelectionData(image: HTMLElement, svg: string): Record<string, unknown> {
    return {
      pid_tofeed: this.baseUrl,
      svgSelector_tofeed: svg
    };
  }
}
