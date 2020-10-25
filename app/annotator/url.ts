import _ from 'lodash'

const skipUrlTerms = ['#', 'data:', '"data:']


/**
 * All URLs in the document (such as links, images or other assets) must be
 * replaced with proxy URL so if users follow the links it still works, or to
 * avoid CORS issues.
 */
export function replaceUrl(proxyUrl: string, baseUrl: string, url: string): string {
  if (shouldNotReplaceUrl(url)) {
    return url
  }

  if (isAbsolute(url)) {
    return toProxyUrl(proxyUrl, baseUrl, url)
  }

  return toProxyUrl(proxyUrl, baseUrl, new URL(url, baseUrl).href)
}


/**
 * Anchors and data URLs should not be replaced with proxy URL.
 */
function shouldNotReplaceUrl(url: string): boolean {
  return skipUrlTerms.some(term => _.startsWith(url, term))
}


/**
 * Sanitize the original URL and convert it to the proxy URL.
 */
function toProxyUrl(proxyUrl: string, baseUrl: string, url: string): string {
  const sanitizedUrl = addProtocol(baseUrl, replaceAmps(url))
  return `${proxyUrl}?url=${encodeURIComponent(sanitizedUrl)}`
}


/**
 * HTML documents often use URLs starting with "//" indicating that the same
 * protocol as for the HTML document. Therefore, we need to add the protocol
 * of the base URL so that the proxy can use it.
 */
function addProtocol(baseUrl: string, url: string): string {
  const baseProtocol = _.head(baseUrl.split('://'))
  return url.indexOf('//') === 0 ? `${baseProtocol}:${url}` : url
}


/**
 * In HTML, "&" in URLs are often encoded to "&amp;". Since we encode the URL
 * ourselves later, we first need to get rid of those.
 */
function replaceAmps(url: string): string {
  return url.split('&amp;').join('&')
}


/**
 * Absolute URL either includes "<protocol>://" or starts with "//".
 */
function isAbsolute(url: string): boolean {
  return (url.indexOf('://') > 0 || url.indexOf('//') === 0)
}
