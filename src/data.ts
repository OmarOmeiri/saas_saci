import uniqid from 'uniqid';
import { csvToArray } from './CSV';
import { saciTimeToDecimal, strIsDate } from './utils';
import dayjs from 'dayjs';
import { groupBy, round } from 'lodash';

const getCanacSaas = (str: string) => {
  try {
    const [canac] = /\(.*\)/.exec(str)
    return canac.replace(/\(|\)/g, '').trim();
  } catch {
    return ''
  }
}

const getCanacSaci = (str: string) => {
  try {
    const [canac] = /\d+/.exec(str)
    return canac.replace(/\(|\)/g, '').trim();
  } catch {
    return ''
  }
}


const saciCSVToData = async (saci: string): Promise<TCSVData> => {
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

const saciXLTToData = async (saci: string): Promise<TCSVData> => {
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

function toJson(data: TCSVData, type: 'saas'): SAASData[]
function toJson(data: TCSVData, type: 'saci'): SACIData[]
function toJson(data: TCSVData, type: 'saas' | 'saci'): SAASData[] | SACIData[] {
  if (type === 'saas') {
    return data.data.map((d) => ({
      id: d[d.length - 1],
      date: dayjs(d[1], 'DD/MM/YYYY').toDate(),
      acft: d[4].replace('-', '').trim(),
      crew: d[2].replace(/\(\d+\)/, '').trim(),
      studentCanac: getCanacSaas(d[2]),
      dep: d[5].split('-')[0].trim(),
      arr: d[5].split('-')[1].trim(),
      tTotal: Number(d[6]),
      tDay: Number(d[7]),
      tNight: Number(d[8]),
      tNav: Number(d[9]),
      tIFR: Number(d[10]),
      tCapt: Number(d[11]),
      ldg: Number(d[12]),
      NM: Number(d[13]),
    }));
  }
  return data.data.map((d) => {
    return {
    id: d[d.length - 1],
    date: dayjs(d[0], 'D/M/YYYY').toDate(),
    acft: d[1],
    crew: d[4],
    studentCanac: getCanacSaci(d[4]),
    dep: d[6],
    arr: d[7],
    tTotal: saciTimeToDecimal(d[10]) + saciTimeToDecimal(d[11]),
    tDay: saciTimeToDecimal(d[10]),
    tNight: saciTimeToDecimal(d[11]),
    tNav: saciTimeToDecimal(d[12]),
    tIFR: saciTimeToDecimal(d[13]),
    tCapt: saciTimeToDecimal(d[14]),
    ldg: Number(d[5]),
    NM: Number(d[16].replace(',', '.').trim()),
    func: d[9].trim(),
    obs: d[8].trim(),
    status: d[18].trim(),
    reg: d[19].trim(),
    exclusionDate: d[20].trim(),
    excludedBy: d[21].trim()
  }});
}


export const saasToData = (saas: string): SAASData[] => {
  const arr = JSON.parse(saas) as string[][]
  arr[0].push('id')

  for (let i = 1; i < arr.length; i++) {
    arr[i].push(uniqid())
  }

  const header = arr.shift();
  arr.sort((a, b) => dayjs(a[1], 'DD/MM/YYYY').toDate().getTime() > dayjs(b[1], 'DD/MM/YYYY').toDate().getTime() ? -1 : 1)
  return toJson({
    header,
    data: arr,
  }, 'saas')
}

export const saciToData = async (saci: string, excel: boolean): Promise<SACIData[]> => {
  if (!excel) return toJson(await saciCSVToData(saci), 'saci');
  return toJson(await saciXLTToData(saci), 'saci')
}

const groupString = (d1: string, d2: string) => {
  if (d1 === d2) return d1;
  return `${d1},${d2}`
}

const groupNav = (d: SACIData[]) => {
  return d.reduce((g, v) => {
    if (!g) return v;
    return {
      id: uniqid(),
      date: g.date,
      acft: g.acft,
      crew: g.crew,
      studentCanac: g.studentCanac,
      dep: `${g.dep},${v.dep}`,
      arr: `${g.arr},${v.arr}`,
      tTotal: round(g.tTotal + v.tTotal, 1),
      tDay: round(g.tDay + v.tDay, 1),
      tNight: round(g.tNight + v.tNight, 1),
      tNav: round(g.tNav + v.tNav, 1),
      tIFR: round(g.tIFR + v.tIFR, 1),
      tCapt: round(g.tCapt + v.tCapt, 1),
      ldg: g.ldg + v.ldg,
      NM: round(g.NM + v.NM, 1),
      func: groupString(g.func, v.func),
      obs: groupString(g.obs, v.obs),
      status: groupString(g.status, v.status),
      reg: groupString(g.reg, v.reg),
      exclusionDate: groupString(g.exclusionDate, v.exclusionDate),
      excludedBy: groupString(g.excludedBy, v.excludedBy),
    }
  }, null as SACIData | null)
}


export const groupNavSaci = (saci: SACIData[]): SACIData[] => {
  const groupedData: SACIData[] = [];
  const grpObject = groupBy(saci, (d) => `${dayjs(d.date).format('DD/MM/YYYY')}-${d.studentCanac}-${d.acft}`);

  for (const dayValues of Object.values(grpObject)) {
    const toSum: SACIData[] = [];
    for (const value of dayValues) {
      if (value.arr === value.dep) groupedData.push(value);
      else toSum.push(value);
    }
    if (toSum.length) groupedData.push(groupNav(toSum));
  }
  console.log('groupedData: ', groupedData);
  return groupedData
}