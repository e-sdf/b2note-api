function noOfElemSiblings(elem: Element): number {
  return (
    elem.parentNode ?
      [...elem.parentNode.children].filter(n => n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === elem.tagName).length - 1
      : 0
  );
}

function noOfTextSiblings(node: Node): number {
  return (
    node.parentNode ?
      [...node.parentNode.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).length - 1
      : 0
  );
}

function elemIdx(node: Node, tagName: string, count = 1): number {
  return (
    node.previousSibling ?
      node.previousSibling.nodeType === Node.ELEMENT_NODE && (node.previousSibling as Element).tagName === tagName ?
        elemIdx(node.previousSibling, tagName, count + 1)
        : elemIdx(node.previousSibling, tagName, count)
      : count
  );
}

function textIdx(node: Node, count = 1): number {
  return (
    node.previousSibling ?
      node.previousSibling.nodeType === Node.TEXT_NODE ?
        textIdx(node.previousSibling, count + 1)
        : textIdx(node.previousSibling, count)
      : count
  );
}

function idxSel(node: Node): string {
  return (
    node.nodeType === Node.ELEMENT_NODE ?
      noOfElemSiblings(node as Element) > 0 ?
        `[${elemIdx(node, (node as Element).tagName)}]`
        : ""
      : node.nodeType === Node.TEXT_NODE ?
      noOfTextSiblings(node) > 0 ?
        `[${textIdx(node)}]`
        : ""
      : ""
  );
}

function mkPath(node: Node, acc: Array<string> = []): Array<string> {
  return (
    node.nodeType === Node.ELEMENT_NODE ?
      node.parentNode ?
        mkPath(node.parentNode, [(node as Element).tagName.toLowerCase() + idxSel(node), ...acc])
        : [(node as Element).tagName.toLowerCase() + idxSel(node), ...acc]
      : node.nodeType === Node.TEXT_NODE ?
      node.parentNode ?
        mkPath(node.parentNode, ["text()" + idxSel(node), ...acc])
        : ["text()" + idxSel(node), ...acc]
      : node.parentNode ?
        mkPath(node.parentNode, acc)
        : acc
  );
}

export function getXPathForElement(node: Node): string {
  return "/" + mkPath(node).join("/");
}
