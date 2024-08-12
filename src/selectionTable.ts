import { COL_ORDER, COLMAP_NAMES } from "./consts";

const makeTHead = () => {
  const saas = document.createElement('div');
  const saci = document.createElement('div');
  const blank = document.createElement('div');
  saas.innerText = 'SAAS';
  saci.innerText = 'SACI';
  return [blank, saas, saci]
}

const makeTBody = (saasRow: HTMLTableRowElement, saciRow: HTMLTableRowElement) => {
  const divs: HTMLElement[] = [];
  const saasChildren = Array.from(saasRow.children) as HTMLElement[];
  const saciChildren = Array.from(saciRow.children) as HTMLElement[];
  COL_ORDER.saas.slice(0, COL_ORDER.saas.length - 1).forEach((col, i) => {
    if (COL_ORDER.saci.indexOf(col) < 0) return;
    const name = document.createElement('div');
    name.innerText = COLMAP_NAMES[col];
    const saas = document.createElement('div');
    saas.innerText = saasChildren[i].innerText;
    const saci = document.createElement('div');
    saci.innerText = saciChildren[COL_ORDER.saci.indexOf(col)].innerText;
    if (saasChildren[i].innerText !== saciChildren[COL_ORDER.saci.indexOf(col)].innerText) {
      [name, saas, saci].forEach(el => {
        el.classList.add('divergent-tr');
      })
    }
    return divs.push(...[name, saas, saci]);
  });

  return divs;
}

export const makeCompareSelectionTable = (): HTMLElement => {
  const saasSelection = document.querySelector('#saas-tbl .highlight-tr') as HTMLTableRowElement;
  const saciSelection = document.querySelector('#saci-tbl .highlight-tr') as HTMLTableRowElement;
  if (!saasSelection || !saciSelection) return null;
  const tbl = document.createElement('div');
  tbl.classList.add('selection-comp-table');
  const thead = makeTHead();
  const tbody = makeTBody(saasSelection, saciSelection);
  [...thead, ...tbody].forEach((d) => {
    tbl.appendChild(d);
  });
  return tbl;

}