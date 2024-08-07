import uniqid from 'uniqid';
import { csvToArray } from './CSV';
import { strIsDate } from './utils';
import { TData } from './index';
import dayjs from 'dayjs';

export const saasToData = (saas: string): TData => {
  const arr = JSON.parse(saas) as string[][]
  arr[0].push('id')

  for (let i = 1; i < arr.length; i++) {
    arr[i].push(uniqid())
  }

  const header = arr.shift();
  arr.sort((a, b) => dayjs(a[1], 'DD/MM/YYYY').toDate().getTime() > dayjs(b[1], 'DD/MM/YYYY').toDate().getTime() ? -1 : 1)
  return {
    header,
    data: arr,
  }
}


const saciCSVToData = async (saci: string): Promise<TData> => {
  const arr = await csvToArray(saci);
  arr[0].push('id')
  for (let i = 1; i < arr.length; i++) {
    arr[i].push(uniqid())
  }
  const filtered =  arr.filter((d) => strIsDate(d[0], 'D/M/YYYY'));

  const header = arr.shift();
  return {
    header,
    data: filtered,
  }
}

const saciXLTToData = async (saci: string): Promise<TData> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(saci, "text/xml");
  const header: string[] = [];
  const data: string[][] = [];
  Array.from(xmlDoc.getElementsByTagName("tr"))
  .forEach((row, i) => {
     if (!i) {
      header.push(...Array.from(row.children).map(c => c.innerHTML), 'id')
     } else {
      data.push([...Array.from(row.children).map(c => c.innerHTML), uniqid()])
     }
  });

  const filtered =  data.filter((d) => strIsDate(d[0], 'D/M/YYYY') && !d[17].toLowerCase().includes('exclusão'));

  return {
    header,
    data: filtered,
  }
}

export const saciToData = async (saci: string, excel: boolean): Promise<TData> => {
  if (!excel) return saciCSVToData(saci);
  return saciXLTToData(saci)
}