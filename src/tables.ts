import { isDate } from "lodash";
import { COL_ORDER, COLMAP_NAMES } from "./consts";
import { parentByTag } from "./utils";
import dayjs from "dayjs";

const isNav = (depArr: string) => (depArr.split(',').length > 1);

const toString = (d: unknown) => {
  if (isDate(d)) return dayjs(d).format('DD/MM/YYYY');
  return String(d);
}

const onTRClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const parentTable = parentByTag(target, 'table');
  if (!parentTable) return;
  const highlights = Array.from(parentTable.querySelectorAll('.highlight-tr'));
  for (const highlight of highlights) {
    highlight.classList.remove('highlight-tr');
  }
  if (target.tagName === 'TR') {
    target.classList.add('highlight-tr')
  }
  const row = target.closest("tr");
  if (!row) return;
  row.classList.add('highlight-tr');
}

export function makeTable(data: SACIData[], id: 'saci-tbl'): void
export function makeTable(data: SAASData[], id: 'saas-tbl'): void
export function makeTable(data: SACIData[] | SAASData[], id: 'saci-tbl' | 'saas-tbl'): void {
  const tbl = document.getElementById(id);
  const thead = tbl.querySelector("thead");
  const tbody = tbl.querySelector("tbody");

  const theadTr = document.createElement('tr');
  (
    id === 'saas-tbl'
    ? COL_ORDER.saas
    : COL_ORDER.saci
  ).forEach((key) => {
    const th = document.createElement('th');
    th.innerText = COLMAP_NAMES[key];
    theadTr.appendChild(th);
  });
  thead.replaceChildren(theadTr);

  const rows = data.map(d => {
    const tr = document.createElement('tr');
    tr.addEventListener('click', onTRClick);
    (
      id === 'saas-tbl'
      ? COL_ORDER.saas
      : COL_ORDER.saci
    ).forEach((key) => {
      if (key in d) {
        //@ts-expect-error kjskdj
        const value = d[key]
        const td = document.createElement('td');
        const tdDiv = document.createElement('div');
        tdDiv.classList.add('td-div')
        if ((key === 'dep' || key === 'arr') && isNav(value)) {
          const innerDiv = document.createElement('div');
          innerDiv.classList.add('nav-item');
          innerDiv.innerText = toString(value);
          tdDiv.appendChild(innerDiv);
        } else {
          tdDiv.innerText = toString(value);
        }
        td.appendChild(tdDiv);
        tr.appendChild(td);
        tr.id = d.id;
      }
    })
    return tr;
  });

  tbody.replaceChildren(...rows);

}

