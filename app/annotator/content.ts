import { AxiosResponse } from 'axios'
import _ from 'lodash'
import { replaceUrl } from './url'
import config from '../config'

const hrefRegex = /href=['"]((?:[^"'\/]*\/)*([^'"]+))['"]/g
const srcRegex = /src=['"]((?:[^"'\/]*\/)*([^'"]+))['"]/g
const srcsetRegex = /srcset=['"]([^'"]+)['"]/g
const urlRegex = /url\(([^)]+)\)/g


export function processReponse(proxyUrl: string, baseUrl: string, response: AxiosResponse) {
  const contentType = response.headers['content-type']

  if (_.includes(contentType, 'text/html')) {
    return processHtmlContent(proxyUrl, baseUrl, responseToString(response))
  }

  if (_.includes(contentType, 'text/css')) {
    return processCssContent(proxyUrl, baseUrl, responseToString(response))
  }

  return response.data
}


// Response parsing

function responseToString(response: AxiosResponse): string {
  return stripBOM(response.data.toString())
}

function stripBOM(content: string): string {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1)
  }
  return content
}


// Content processing

function processHtmlContent(proxyUrl: string, baseUrl: string, content: string): string {
  const baseUrlScript = `<script>window.baseUrl = '${baseUrl}'; window.proxyUrl = '${proxyUrl}'</script>`
  const overridesScript = staticScript('annotator-overrides')
  const iframeScript = staticScript('annotator-iframe', true)

  return content
    .replace(hrefRegex, wrapReplacePram(proxyUrl, baseUrl, 'href'))
    .replace(srcRegex, wrapReplacePram(proxyUrl, baseUrl, 'src'))
    .replace(srcsetRegex, wrapReplaceSrcset(proxyUrl, baseUrl))
    .replace('</head>', `${baseUrlScript}${overridesScript}${iframeScript}</head>`)
}

function processCssContent(proxyUrl: string, baseUrl: string, content: string): string {
  return content.replace(urlRegex, wrapReplaceCssUrl(proxyUrl, baseUrl))
}

function staticScript(script: string, defer: boolean = false) {
  return `<script src="${config.serverPath}/static/dist/${script}.js"${defer ? ' defer' : ''}></script>`
}


// HTML attributes replacement

function wrapReplacePram(proxyUrl: string, baseUrl: string, param: string) {
  return (_match: any, url: string) => replaceParam(proxyUrl, baseUrl, param, url)
}

function replaceParam(proxyUrl: string, baseUrl: string, param: string, url: string): string {
  return `${param}="${replaceUrl(proxyUrl, baseUrl, url)}"`
}

function wrapReplaceSrcset(proxyUrl: string, baseUrl: string) {
  return (_match: any, srcset: string) => replaceSrcset(proxyUrl, baseUrl, srcset)
}

function replaceSrcset(proxyUrl: string, baseUrl: string, srcset: string): string {
  const replaceSrcsetItem = (item: string) => {
    const [url, size] = item.trim().split(/\s+/).map(s => s.trim())
    return size ? `${replaceUrl(proxyUrl, baseUrl, url)} ${size}` : replaceUrl(proxyUrl, baseUrl, url)
  }
  const newSrcset = srcset.split(',').map(replaceSrcsetItem).join(',')
  return `srcset="${newSrcset}"`
}


// CSS URL replacement

function wrapReplaceCssUrl(proxyUrl: string, baseUrl: string) {
  return (_match: any, url: string) => replaceCssUrl(proxyUrl, baseUrl, url)
}

function replaceCssUrl(proxyUrl: string, baseUrl: string, url: string): string {
  return `url(${replaceUrl(proxyUrl, baseUrl, url)})`
}