import { Utils } from "./utils";
import { TargetInput } from "../../../../app/core/targetInput";

export abstract class MenuHandler {
  menu: HTMLElement | null = null;

  public init(): void {
    document.addEventListener("contextmenu", this.handleContextMenu.bind(this));
  }

  private get isOpen(): boolean {
    return this.menu != null;
  }

  private handleContextMenu(e: MouseEvent) {
    e.preventDefault();

    if (this.isOpen) return;

    const target = e.target as HTMLElement;
    this.menu = Utils.addElement("b2note-annotator-menu");
    this.addMenuItems(target);
    this.menu.onmouseleave = () => {
      this.close();
    };
    this.setMenuPosition(e);
  }

  protected abstract addMenuItems(target: HTMLElement): void;

  private setMenuPosition(e: MouseEvent) {
    const width = this.menu?.offsetWidth || 0;
    const height = this.menu?.offsetHeight || 0;
    const x = Math.max(0, Math.min(e.pageX - 5, document.body.clientWidth - width));
    const y = Math.max(0, Math.min(e.pageY - 5, document.body.clientHeight - height));
    this.menu?.setAttribute("style", `top: ${y}px; left: ${x}px;`);
  }

  private close() {
    if (this.menu != null) {
      this.menu.classList.add("hidden");

      setTimeout(() => {
        if (this.menu != null) {
          this.menu.outerHTML = "";
          this.menu = null;
        }
      }, 250);
    }
  }

  protected addMenuItem(text: string, data: TargetInput): void {
    const item = document.createElement("div") as HTMLElement;
    item.innerText = text;
    item.onclick = () => {
      Utils.postMessage("iframe.annotate", { data: { target_tofeed: JSON.stringify(data) } });
      this.close();
    };
    this.menu?.appendChild(item);
  }
}
