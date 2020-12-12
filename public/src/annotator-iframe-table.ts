import _ from "lodash";
import * as XLSX from "xlsx";
import { Utils } from "./iframe/utils";
import { TableHandler } from "./iframe/table-handler";
import { TableMenuHandler } from "./iframe/table-menu-handler";
import { TableAnnotationDataFactory } from "./iframe/table-annotation-data-factory";


window.onload = function () {
  const url = _.get(window, "tableUrl");
  loadTable(url, (sheets: Record<string, any[][]>) => {
    Utils.postMessage("iframe.loaded");

    const annotationFactory = new TableAnnotationDataFactory(url);
    const tableHandler = new TableHandler();
    const menuHandler = new TableMenuHandler(tableHandler, annotationFactory);

    tableHandler.init(sheets);
    menuHandler.init();
  });
};

function loadTable(url: string, callback: ((responseData: any) => void)) {
  const req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = "arraybuffer";
  req.onload = () => {
    callback(toJson(req.response));
  };
  req.send();
}

function toJson(responseData: any): Record<string, any[][]> {
  const data = new Uint8Array(responseData);
  const workbook = XLSX.read(data, { type: "array" });
  return workbook.SheetNames.reduce((acc: Record<string, any>, sheetName) => {
    const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    if (roa.length) acc[sheetName] = roa;
    return acc;
  }, {});
}
