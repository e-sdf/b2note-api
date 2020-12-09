import { AxiosResponse } from "axios";
import _ from "lodash";
import { replaceUrl } from "./url";
import config from "../config";

const hrefRegex = /href=['"]((?:[^"'\/]*\/)*([^'"]+))['"]/g;
const srcRegex = /src=['"]((?:[^"'\/]*\/)*([^'"]+))['"]/g;
const srcsetRegex = /srcset=['"]([^'"]+)['"]/g;
const urlRegex = /url\(([^)]+)\)/g;
const targetBlankRegex = /target=['"]_blank['"]/g;
const tableMimeTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"];

export function processResponse<A>(proxyUrl: string, baseUrl: string, root: boolean, response: AxiosResponse<A>): { contentType: string, data: string | A } {
  const contentType = response.headers["content-type"];

  if (_.includes(contentType, "text/html")) {
    return {
      contentType,
      data: processHtmlContent(proxyUrl, baseUrl, responseToString(response))
    };
  }

  if (_.includes(contentType, "text/css")) {
    return {
      contentType,
      data: processCssContent(proxyUrl, baseUrl, responseToString(response))
    };
  }

  if (root && _.includes(contentType, "image")) {
    return {
      contentType: "text/html",
      data: processRootImageContent(proxyUrl, baseUrl)
    };
  }

  if (root && tableMimeTypes.some(type => _.includes(contentType, type))) {
    return {
      contentType: "text/html",
      data: processTableContent(proxyUrl, baseUrl)
    };
  }

  return {
    contentType,
    data: response.data
  };
}


// Response parsing

function responseToString(response: AxiosResponse): string {
  return stripBOM(response.data.toString());
}

function stripBOM(content: string): string {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}


// Content processing

function processHtmlContent(proxyUrl: string, baseUrl: string, content: string): string {
  return content
    .replace(hrefRegex, wrapReplacePram(proxyUrl, baseUrl, "href"))
    .replace(srcRegex, wrapReplacePram(proxyUrl, baseUrl, "src"))
    .replace(srcsetRegex, wrapReplaceSrcset(proxyUrl, baseUrl))
    .replace(targetBlankRegex, "")
    .replace("</head>", `${headerExtra(proxyUrl, baseUrl)}</head>`);

}

function processCssContent(proxyUrl: string, baseUrl: string, content: string): string {
  return content.replace(urlRegex, wrapReplaceCssUrl(proxyUrl, baseUrl));
}

function processRootImageContent(proxyUrl: string, baseUrl: string) {
  const imageUrl = replaceUrl(proxyUrl, baseUrl, baseUrl);
  return `<!doctype html><html><head>${headerExtra(proxyUrl, baseUrl, false)}</head><body><img src="${imageUrl}"></body></html>`;
}

function processTableContent(proxyUrl: string, baseUrl: string) {
  return `<!doctype html><html><head>${headerExtraTable(proxyUrl, baseUrl)}</head><body><div id="table-wrapper" class="table-wrapper"></div><div id="sheetlist" class="sheetlist"></div></body></html>`;
}

function staticScript(script: string, defer = false) {
  return `<script src="${config.serverPath}/static/dist/${script}.js" ${defer ? "defer" : ""}></script>`;
}

function styleLink(style: string) {
  return `<link rel="stylesheet" type="text/css" href="${config.serverPath}/static/dist/css/${style}.css" />`;
}


// HTML attributes replacement

function wrapReplacePram(proxyUrl: string, baseUrl: string, param: string) {
  return (_match: unknown, url: string) => replaceParam(proxyUrl, baseUrl, param, url);
}

function replaceParam(proxyUrl: string, baseUrl: string, param: string, url: string): string {
  return `${param}="${replaceUrl(proxyUrl, baseUrl, url)}"`;
}

function wrapReplaceSrcset(proxyUrl: string, baseUrl: string) {
  return (_match: unknown, srcset: string) => replaceSrcset(proxyUrl, baseUrl, srcset);
}

function replaceSrcset(proxyUrl: string, baseUrl: string, srcset: string): string {
  const replaceSrcsetItem = (item: string) => {
    const [url, size] = item.trim().split(/\s+/).map(s => s.trim());
    return size ? `${replaceUrl(proxyUrl, baseUrl, url)} ${size}` : replaceUrl(proxyUrl, baseUrl, url);
  };
  const newSrcset = srcset.split(",").map(replaceSrcsetItem).join(",");
  return `srcset="${newSrcset}"`;
}


// CSS URL replacement

function wrapReplaceCssUrl(proxyUrl: string, baseUrl: string) {
  return (_match: unknown, url: string) => replaceCssUrl(proxyUrl, baseUrl, url);
}

function replaceCssUrl(proxyUrl: string, baseUrl: string, url: string): string {
  return `url(${replaceUrl(proxyUrl, baseUrl, url)})`;
}


// Helpers

function headerExtra(proxyUrl: string, baseUrl: string, annotatePage = true): string {
  const baseUrlScript = `<script>window.baseUrl = '${baseUrl}'; window.proxyUrl = '${proxyUrl}'; window.annotatePage = ${annotatePage};</script>`;
  const overridesScript = staticScript("annotator-overrides");
  const iframeScript = staticScript("annotator-iframe", true);
  const style = styleLink("annotator-iframe");
  return `${baseUrlScript}${overridesScript}${iframeScript}${style}`;
}

function headerExtraTable(proxyUrl: string, baseUrl: string): string {
  const tableUrl = replaceUrl(proxyUrl, baseUrl, baseUrl);
  const baseUrlScript = `<script>window.tableUrl = '${tableUrl}';</script>`;
  const script = staticScript("annotator-iframe-table");
  const baseStyle = styleLink("annotator-iframe");
  const tableStyle = styleLink("annotator-iframe-table");
  return `${baseUrlScript}${script}${tableStyle}${baseStyle}`;
}
