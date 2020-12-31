import { AnnotationDataFactory } from "../common/annotation-data-factory";
import { TargetInput, TargetInputType } from "../../../../app/core/targetInput";

export class ImageAnnotationDataFactory extends AnnotationDataFactory {
  getImageData(): TargetInput {
    return {
      type: TargetInputType.PAGE,
      pid: this.baseUrl
    };
  }

  getImageSelectionData(svgSelector: string): TargetInput {
    return {
      type: TargetInputType.IMAGE_REGION,
      pid: this.baseUrl,
      svgSelector
    };
  }
}
