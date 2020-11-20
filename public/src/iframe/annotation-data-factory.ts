import { getXPathForElement } from "./xpath";
import { Utils } from "./utils";

export class AnnotationDataFactory {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getPageData(): Record<string, unknown> {
    return {
      pid_tofeed: this.baseUrl,
      subject_tofeed: this.baseUrl
    };
  }

  getSelectionData(selection: Selection | null): Record<string, unknown> {
    const node = selection?.focusNode;
    if (node) {
      const range = selection?.getRangeAt(0);
      if (range) {
        const [startOffset, endOffset] = [range.startOffset, range.endOffset];
        if (startOffset < endOffset) {
          const textContent = node.textContent;
          if (textContent) {
            return {
              pid_tofeed: this.baseUrl,
              subject_tofeed: this.baseUrl,
              xPath_tofeed: getXPathForElement(node),
              textContent_tofeed: textContent,
              startOffset_tofeed: range.startOffset,
              endOffset_tofeed: range.endOffset
            };
          }
        }
      }
    }
    return {};
  }

  getLinkData(link: HTMLElement): Record<string, unknown> {
    return {
      pid_tofeed: this.baseUrl,
      subject_tofeed: Utils.fromProxyURL(link.getAttribute("href"))
    };
  }

  getImageData(image: HTMLElement): Record<string, unknown> {
    return {
      pid_tofeed: this.baseUrl,
      subject_tofeed: Utils.fromProxyURL(image.getAttribute("src"))
    };
  }

  getImageSelectionData(image: HTMLElement, svg: string): Record<string, unknown> {
    return {
      pid_tofeed: this.baseUrl,
      subject_tofeed: Utils.fromProxyURL(image.getAttribute("src")),
      SVG_Selector_tofeed: svg
    };
  }
}
