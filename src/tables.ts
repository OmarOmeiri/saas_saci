import { TData } from ".";

export const makeTable = (data: TData, id: string) => {
  const tbl = document.getElementById(id);
  const thead = tbl.querySelector("thead");
  const tbody = tbl.querySelector("tbody");
  

  const idIndex = data.header.findIndex((v) => v === 'id')

  const theadTr = document.createElement('tr');
  data.header.forEach((d) => {
    const th = document.createElement('th');
    th.innerText = d;
    theadTr.appendChild(th);
  });
  thead.replaceChildren(theadTr);

  const rows = data.data.map(d => {
    const tr = document.createElement('tr');
    d.forEach((el, i) => {
      const td = document.createElement('td');
      td.innerText = el;
      tr.appendChild(td);
      if (i === idIndex) tr.id = el;
    })
    return tr;
  });

  tbody.replaceChildren(...rows);

}