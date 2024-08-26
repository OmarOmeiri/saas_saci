import { COL_ORDER, COLMAP_NAMES } from "./consts";
import { arrayOuterJoin } from "./utils";

const makeTHead = () => {
  const saas = document.createElement('div');
  const saci = document.createElement('div');
  const blank = document.createElement('div');
  saas.innerText = 'SAAS';
  saci.innerText = 'SACI';
  return [blank, saas, saci]
}

const compare = (d1: string, d2: string, col: string): boolean => {
  if (col === 'dep' || col === 'arr') {
    if (d1 === d2) return true;
    const legs = [d1.split(','), d2.split(',')]
    if (legs[0].length === 1 && legs[1].length === 1 && legs[0][0] === legs[1][0]) return true;
    if (arrayOuterJoin(legs[0], legs[1]).length) return false;
    return true 
  }
  return d1 === d2 ? true : false;
}

const makeTBody = (saasRow: HTMLTableRowElement, saciRow: HTMLTableRowElement) => {
  const divs: HTMLElement[] = [];
  const saasChildren = Array.from(saasRow.children) as HTMLElement[];
  const saciChildren = Array.from(saciRow.children) as HTMLElement[];
  COL_ORDER.saas.slice(0, COL_ORDER.saas.length - 1).forEach((col, i) => {
    console.log('col: ', col);
    if (COL_ORDER.saci.indexOf(col) < 0) return;
    const name = document.createElement('div');
    name.innerText = COLMAP_NAMES[col];
    const saas = document.createElement('div');
    saas.innerText = saasChildren[i].innerText;
    const saci = document.createElement('div');
    saci.innerText = saciChildren[COL_ORDER.saci.indexOf(col)].innerText;
    if (!compare(saasChildren[i].innerText, saciChildren[COL_ORDER.saci.indexOf(col)].innerText, col)) {
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