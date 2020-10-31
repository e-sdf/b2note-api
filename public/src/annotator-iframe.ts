export {};

window.onload = function () {
  document.addEventListener("mouseup", function (e) {
    const selection = window.getSelection();
    const target = {
      pid: "",
      source: null,
      selection: createSelectionSnapshot(selection)
    };
    console.log({ target });

  });

  parent.postMessage({ "type": "iframe.loaded" }, "*");
};


function createSelectionSnapshot(selection: Selection | null) {
  const node = selection?.focusNode;

  if (node) {
    const range = selection?.getRangeAt(0);
    if (range) {
      const [startOffset, endOffset] = [range.startOffset, range.endOffset];
      if (startOffset < endOffset) {
        const textContent = node.textContent;
        if (textContent) {
          return {
            node: null,
            textContent,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            selectedText: selection?.toString()
          };
        }
      }
    }
  }
  return null;
}
