import { AnnotationDataFactory } from "../common/annotation-data-factory";
import { TargetInput, TargetInputType } from "../../../../app/core/targetInput";

export class PdfAnnotationDataFactory extends AnnotationDataFactory {
  getDocumentData(): TargetInput {
    return {
      type: TargetInputType.PAGE,
      pid: this.baseUrl
    };
  }

  getPageData(pageNumber: number): TargetInput {
    return {
      type: TargetInputType.PDF,
      pid: this.baseUrl,
      pageNumber
    };
  }

  getPageSelectionData(pageNumber: number, svgSelector: string): TargetInput {
    return {
      type: TargetInputType.PDF,
      pid: this.baseUrl,
      pageNumber,
      svgSelector
    };
  }
}
