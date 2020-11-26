import { AnnotationDataFactory } from "../common/annotation-data-factory";
import { TargetInput, TargetType } from "../../../../app/core/targetInput";

export class ImageAnnotationDataFactory extends AnnotationDataFactory {
  getImageData(): TargetInput {
    return {
      type: TargetType.PAGE,
      pid: this.baseUrl
    };
  }

  getImageSelectionData(svgSelector: string): TargetInput {
    return {
      type: TargetType.IMAGE_REGION,
      pid: this.baseUrl,
      svgSelector
    };
  }
}
