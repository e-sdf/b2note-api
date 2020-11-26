import { AnnotationDataFactory } from "../common/annotation-data-factory";
import { TargetInput, TargetType } from "../../../../app/core/targetInput";

export class PdfAnnotationDataFactory extends AnnotationDataFactory {
  getDocumentData(): TargetInput {
    return {
      type: TargetType.PAGE,
      pid: this.baseUrl
    };
  }

  getPageData(pageNumber: number): TargetInput {
    return {
      type: TargetType.PDF,
      pid: this.baseUrl,
      pageNumber
    };
  }

  getPageSelectionData(pageNumber: number, svgSelector: string): TargetInput {
    return {
      type: TargetType.PDF,
      pid: this.baseUrl,
      pageNumber,
      svgSelector
    };
  }
}
