import { isAbsolute } from "../../app/annotator/url";
import { getXPathForElement } from "./xpath";


function postMessage(type: string, payload: Record<string, unknown> = {}): void {
  parent.postMessage({ type, ...payload }, "*");
}

window.onload = function () {
  postMessage("iframe.loaded");

  let menuOpen = false;

  document.addEventListener("contextmenu", (e: MouseEvent) => {
    e.preventDefault();


    if (!menuOpen) {
      const target = e.target as HTMLElement;

      // Create menu container
      const menu = document.createElement("div") as HTMLElement;
      menu.classList.add("b2note-annotator-menu");

      // Close menu container
      const closeMenu = () => {
        menuOpen = false;
        menu.classList.add("hidden");
        setTimeout(() => {
          menu.outerHTML = "";
        }, 250);
      };

      // Add annotate page option
      const annotatePage = createMenuItem("Annotate page", () => {
        postMessage("iframe.annotate.page");
        closeMenu();
      });
      menu.appendChild(annotatePage);

      // Add annotate selection option
      const selection = window.getSelection();
      if (selection?.type === "Range") {
        const snapshot = createSelectionSnapshot(selection);
        const annotateSelection = createMenuItem("Annotate selection", () => {
          postMessage("iframe.annotate.selection", snapshot);
          closeMenu();
        });
        menu.appendChild(annotateSelection);
      }

      // Add annotate link option
      const closestLink = findClosestLink(target);
      if (closestLink) {
        const annotateLink = createMenuItem("Annotate link", () => {
          postMessage("iframe.annotate.link", { href: fromProxyURL(closestLink.getAttribute("href")) });
          closeMenu();
        });
        menu.appendChild(annotateLink);
      }

      // Add annotate image option
      if (target.tagName == "IMG") {
        const annotateImage = createMenuItem("Annotate image", () => {
          postMessage("iframe.annotate.image", { src: fromProxyURL(target.getAttribute("src")) });
          closeMenu();
        });
        menu.appendChild(annotateImage);
      }

      // add menu and set its position
      document.body.appendChild(menu);
      menu.onmouseleave = closeMenu;
      setMenuPosition(menu, e);

      menuOpen = true;
    }
  });
};


function setMenuPosition(menu: HTMLElement, e: MouseEvent): void {
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const x = Math.max(0, Math.min(e.pageX - 5, document.body.clientWidth - width));
  const y = Math.max(0, Math.min(e.pageY - 5, document.body.clientHeight - height));
  menu.setAttribute("style", `top: ${y}px; left: ${x}px;`);
}

function createMenuItem(text: string, callback: ((ev: MouseEvent) => void)): HTMLElement {
  const item = document.createElement("div") as HTMLElement;
  item.innerText = text;
  item.onclick = callback;
  return item;
}

function findClosestLink(element: HTMLElement | null): HTMLElement | null {
  while (element) {
    if (element.tagName == "A") {
      return element;
    }
    element = element?.parentElement;
  }
  return null;
}

function fromProxyURL(urlString: string | null): string | null {
  if (urlString && !isAbsolute(urlString)) {
    const url = urlString.match(/url=([^&]*)/);
    if (url && url.length > 0) {
      return decodeURIComponent(url[1]);
    }
  }
  return urlString;
}

function createSelectionSnapshot(selection: Selection | null): Record<string, unknown> {
  const node = selection?.focusNode;
  if (node) {
    const range = selection?.getRangeAt(0);
    if (range) {
      const [startOffset, endOffset] = [range.startOffset, range.endOffset];
      if (startOffset < endOffset) {
        const textContent = node.textContent;
        if (textContent) {
          return {
            textContent,
            xPath: getXPathForElement(node),
            startOffset: range.startOffset,
            endOffset: range.endOffset,
          };
        }
      }
    }
  }
  return {};
}
