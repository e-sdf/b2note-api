import _ from "lodash";
import { Utils } from "./annotator/common/utils";
import { ImageSelectionHandler } from "./annotator/image-selection-handler";
import { PdfController } from "./annotator/pdf/pdf-controller";
import { PdfMenuHandler } from "./annotator/pdf/pdf-menu-handler";
import { PdfAnnotationDataFactory } from "./annotator/pdf/pdf-annotation-data-factory";

const pdfjsLib = _.get(window, "pdfjs-dist/build/pdf");
pdfjsLib.GlobalWorkerOptions.workerSrc = "//mozilla.github.io/pdf.js/build/pdf.worker.js";


window.onload = function () {
  const url = _.get(window, "pdfUrl");
  pdfjsLib.getDocument(url).promise.then((pdfDoc: any) => {
    Utils.postMessage("iframe.loaded");

    const pdfHandler = new PdfController();
    const imageSelectionHandler = new ImageSelectionHandler();
    const annotationFactory = new PdfAnnotationDataFactory(Utils.fromProxyURL(url));
    const pdfMenuHandler = new PdfMenuHandler(pdfHandler, imageSelectionHandler, annotationFactory);

    pdfHandler.addListener("renderPage", () => {
      imageSelectionHandler.clearSelection();
    });

    imageSelectionHandler.init();
    pdfHandler.init(pdfDoc);
    pdfMenuHandler.init();
  });
};
