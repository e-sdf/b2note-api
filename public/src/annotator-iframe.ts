import _ from "lodash";
import { Utils } from "./annotator/common/utils";
import { HtmlAnnotationDataFactory } from "./annotator/html/html-annotation-data-factory";
import { ImageSelectionHandler } from "./annotator/image-selection-handler";
import { HtmlMenuHandler } from "./annotator/html/html-menu-handler";
import { ImageAnnotationDataFactory } from "./annotator/image/image-annotation-data-factory";
import { ImageMenuHandler } from "./annotator/image/image-menu-handler";

window.onload = function () {
  Utils.postMessage("iframe.loaded");

  const annotatePage = _.get(window, "annotatePage");
  const baseUrl = _.get(window, "baseUrl");

  const imageSelectionHandler = new ImageSelectionHandler();
  imageSelectionHandler.init();

  if (annotatePage) {
    const annotationFactory = new HtmlAnnotationDataFactory(baseUrl);
    const menuHandler = new HtmlMenuHandler(imageSelectionHandler, annotationFactory);
    menuHandler.init();
  } else {
    const annotationFactory = new ImageAnnotationDataFactory(baseUrl);
    const menuHandler = new ImageMenuHandler(imageSelectionHandler, annotationFactory);
    menuHandler.init();
  }
};
