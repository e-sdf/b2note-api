import { isAbsolute } from "../../../../app/annotator/url";

export class Utils {
  public static postMessage(type: string, payload: Record<string, unknown> = {}): void {
    parent.postMessage({ type, ...payload }, "*");
  }

  public static addElement(className: string): HTMLElement {
    const div = document.createElement("div") as HTMLElement;
    div.classList.add(className);
    document.body.appendChild(div);
    return div;
  }

  public static findClosestLink(element: HTMLElement | null): HTMLElement | null {
    while (element) {
      if (element.tagName == "A") {
        return element;
      }
      element = element?.parentElement;
    }
    return null;
  }

  static fromProxyURL(urlString: string | null): string {
    if (urlString && !isAbsolute(urlString)) {
      const url = urlString.match(/url=([^&]*)/);
      if (url && url.length > 0) {
        return decodeURIComponent(url[1]);
      }
    }
    return urlString || "";
  }
}
