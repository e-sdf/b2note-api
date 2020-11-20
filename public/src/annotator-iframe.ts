import _ from "lodash";
import { Utils } from "./iframe/utils";
import { AnnotationDataFactory } from "./iframe/annotation-data-factory";
import { ImageSelectionHandler } from "./iframe/image-selection-handler";
import { MenuHandler } from "./iframe/menu-handler";

window.onload = function () {
  Utils.postMessage("iframe.loaded");

  const annotatePage = _.get(window, "annotatePage");
  const baseUrl = _.get(window, "baseUrl");

  const annotationDataFactory = new AnnotationDataFactory(baseUrl);
  const imageSelectionHandler = new ImageSelectionHandler();
  const menuHandler = new MenuHandler(imageSelectionHandler, annotationDataFactory, annotatePage);

  imageSelectionHandler.init();
  menuHandler.init();
};
