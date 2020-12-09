import _ = require("lodash");

const charCodeOfA = "A".charCodeAt(0);
const alphabetLength = "Z".charCodeAt(0) - charCodeOfA + 1;


export class TableHandler {
  tableWrapper: HTMLElement | null = null;
  sheetlist: HTMLElement | null = null;
  sheets: Record<string, any[][]> | null = null;
  sheetLinks : Record<string, HTMLElement> = {};
  currentSheet  = "";

  public init(sheets: Record<string, any[][]>): void {
    this.tableWrapper = document.getElementById("table-wrapper");
    this.sheetlist = document.getElementById("sheetlist");
    this.sheets = sheets;

    this.renderSheetList();
    this.renderFirstSheet();
  }

  public get selectedSheet(): string {
    return this.currentSheet;
  }

  private renderSheetList(): void {
    if (this.sheets) {
      Object.entries(this.sheets).forEach(([sheetName], index) => {
        const sheetLink = document.createElement("a") as HTMLElement;
        sheetLink.innerText = sheetName;
        this.sheetlist?.appendChild(sheetLink);

        if (index == 0) {
          sheetLink.classList.add("selected");
          this.currentSheet = sheetName;
        }

        sheetLink.onclick = () => {
          this.setActiveSheet(sheetName);
        };

        this.sheetLinks[sheetName] = sheetLink;
      });
    }
  }

  private setActiveSheet(sheetName: string) {
    Object.entries(this.sheetLinks).forEach(([name, data]) => {
      if (name == sheetName) {
        data.classList.add("selected");
      } else {
        data.classList.remove("selected");
      }
    });

    if (this.sheets) {
      this.renderSheet(this.sheets[sheetName]);
    }

    this.currentSheet = sheetName;
  }

  // sheet rendering

  private renderFirstSheet(): void {
    if (this.sheets) {
      const sheet = _.first(Object.entries(this.sheets));
      if (sheet) {
        this.renderSheet(sheet[1]);
      }
    }
  }

  private renderSheet(sheet: any[][]): void {
    if (this.tableWrapper) this.tableWrapper.innerHTML = "";
    const table = this.createTable(sheet);
    this.tableWrapper?.appendChild(table);
  }

  // table creation

  private createTable(sheet: any[][]) {
    const maxLength = sheet.reduce((max, row) => Math.max(max, row.length), 0);
    const table = document.createElement("table");

    table.appendChild(this.createHeader(maxLength));

    sheet.forEach((row, index) => {
      table.appendChild(this.createRow(index, maxLength, row));
    });

    return table;
  }

  private createHeader(size: number): HTMLElement {
    const tr = document.createElement("tr");

    // empty top left cell
    tr.appendChild(document.createElement("th"));

    for (let i = 1; i <= size; i++) {
      const th = document.createElement("th");
      th.innerText = this.numberToLetters(i);
      tr.appendChild(th);
    }

    return tr;
  }

  private createRow(index: number, size:number, data: any[]): HTMLElement {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.innerText = `${index + 1}`;
    tr.appendChild(th);

    for (let i = 0; i < size; i++) {
      const td = document.createElement("td");
      td.innerHTML = data[i] || data[i] == 0 ? data[i] : "&nbsp;";
      td.className = _.isNumber(data[i]) ? "text-right" : "";
      td.dataset.col = `${(i + 1)}`;
      td.dataset.row = `${index + 1}`;
      tr.appendChild(td);
    }

    return tr;
  }

  // utils

  private numberToLetters(nNum: number) {
    if (nNum <= alphabetLength) {
      return this.convertNumberToLetter(nNum);
    } else {
      const firstNumber = Math.floor((nNum - 1) / alphabetLength);
      const firstLetter = this.convertNumberToLetter(firstNumber);

      const secondNumber = (nNum % alphabetLength) || alphabetLength;
      const secondLetter = this.convertNumberToLetter(secondNumber);

      return firstLetter + secondLetter;
    }
  }

  private convertNumberToLetter(nNum: number) {
    const charCode = charCodeOfA + nNum - 1;
    return String.fromCharCode(charCode);
  }
}
