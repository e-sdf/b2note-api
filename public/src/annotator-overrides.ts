import _ = require('lodash')
import { replaceUrl } from '../../app/annotator/url'


const baseUrl = _.get(window, 'baseUrl')
const proxyUrl = _.get(window, 'proxyUrl')


const orignAppendChild = Node.prototype.appendChild
// @ts-ignore
Node.prototype.appendChild = function () {
  arguments[0] = replaceElementSrc(arguments[0])
  // @ts-ignore
  return orignAppendChild.apply(this, arguments)
}

const origInsertBefore = Node.prototype.insertBefore
// @ts-ignore
Node.prototype.insertBefore = function () {
  arguments[0] = replaceElementSrc(arguments[0])
  // @ts-ignore
  return origInsertBefore.apply(this, arguments)
}


const origOpen = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function () {
  if (arguments.length > 1) {
    arguments[1] = replaceUrl(proxyUrl, baseUrl, arguments[1])
  }
  // @ts-ignore
  return origOpen.apply(this, arguments)
}


function replaceElementSrc(element: HTMLElement) {
  const src = _.get(element, 'src')
  if (!_.isEmpty(src)) {
    _.set(element, 'src', replaceUrl(proxyUrl, baseUrl, src))
  }
  return element
}
