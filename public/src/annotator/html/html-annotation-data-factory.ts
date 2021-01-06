import { getXPathForElement } from "../common/xpath";
import { Utils } from "../common/utils";
import { AnnotationDataFactory } from "../common/annotation-data-factory";
import { TargetInput, TargetInputType } from "../../../../app/core/targetInput";

export class HtmlAnnotationDataFactory extends AnnotationDataFactory {
  getPageData(): TargetInput {
    return {
      type: TargetInputType.PAGE,
      pid: this.baseUrl
    };
  }

  getSelectionData(selection: Selection | null): TargetInput | null {
    const node = selection?.focusNode;
    if (node) {
      const range = selection?.getRangeAt(0);
      if (range) {
        const [startOffset, endOffset] = [range.startOffset, range.endOffset];
        if (startOffset < endOffset) {
          const textContent = node.textContent;
          if (textContent) {
            return {
              type: TargetInputType.TEXT_SELECTION,
              pid: this.baseUrl,
              xPath: getXPathForElement(node),
              startOffset: range.startOffset,
              endOffset: range.endOffset,
              selectedText: textContent.substring(range.startOffset, range.endOffset)
            };
          }
        }
      }
    }
    return null;
  }

  getLinkData(link: HTMLElement): TargetInput {
    return {
      type: TargetInputType.LINK,
      pid: this.baseUrl,
      source: Utils.fromProxyURL(link.getAttribute("href"))
    };
  }

  getImageData(image: HTMLElement): TargetInput {
    return {
      type: TargetInputType.LINK,
      pid: this.baseUrl,
      source: Utils.fromProxyURL(image.getAttribute("src"))
    };
  }

  getImageSelectionData(image: HTMLElement, svgSelector: string): TargetInput {
    return {
      type: TargetInputType.IMAGE_REGION_ON_PAGE,
      pid: this.baseUrl,
      source: Utils.fromProxyURL(image.getAttribute("src")),
      svgSelector
    };
  }
}
