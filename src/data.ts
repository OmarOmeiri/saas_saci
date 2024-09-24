import uniqid from 'uniqid';
import { csvToArray } from './CSV';
import { saciTimeToDecimal, strIsDate } from './utils';
import dayjs from 'dayjs';
import { groupBy, round } from 'lodash';
import { COLMAP_INDEX } from './consts';

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


const filterSaciData = (data: string[][]) => (
  data.filter((d) => (
    strIsDate(d[COLMAP_INDEX.saci.date], 'D/M/YYYY') && !d[COLMAP_INDEX.saci.status].toLowerCase().includes('exclusão')
  ))
);

const saciCSVToData = async (saci: string): Promise<TCSVData> => {
  const arr = await csvToArray(saci);
  arr[0].push('id')
  for (let i = 1; i < arr.length; i++) {
    arr[i].push(uniqid())
  }

  const header = arr.shift();
  return {
    header,
    data: filterSaciData(arr),
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

  return {
    header,
    data: filterSaciData(data),
  }
}



function toJson(data: TCSVData, type: 'saas'): SAASData[]
function toJson(data: TCSVData, type: 'saci'): SACIData[]
function toJson(data: TCSVData, type: 'saas' | 'saci'): SAASData[] | SACIData[] {
  if (type === 'saas') {
    return data.data.map((d) => ({
      id: d[d.length - 1],
      date: dayjs(d[COLMAP_INDEX.saas.date], 'DD/MM/YYYY').toDate(),
      acft: d[COLMAP_INDEX.saas.acft].replace('-', '').trim(),
      crew: d[COLMAP_INDEX.saas.crew].replace(/\(\d+\)/, '').trim(),
      studentCanac: getCanacSaas(d[COLMAP_INDEX.saas.crew]),
      dep: d[COLMAP_INDEX.saas.depArr].split('-')[0].trim(),
      arr: d[COLMAP_INDEX.saas.depArr].split('-')[1].trim(),
      tTotal: Number(d[COLMAP_INDEX.saas.tTotal]),
      tDay: Number(d[COLMAP_INDEX.saas.tDay]),
      tNight: Number(d[COLMAP_INDEX.saas.tNight]),
      tNav: Number(d[COLMAP_INDEX.saas.tNav]),
      tIFR: Number(d[COLMAP_INDEX.saas.tIFR]),
      tCapt: Number(d[COLMAP_INDEX.saas.tCapt]),
      ldg: Number(d[COLMAP_INDEX.saas.ldg]),
      NM: Number(d[COLMAP_INDEX.saas.NM]),
    }));
  }
  return data.data.map((d) => {
    return {
    id: d[d.length - 1],
    date: dayjs(d[COLMAP_INDEX.saci.date], 'D/M/YYYY').toDate(),
    acft: d[COLMAP_INDEX.saci.acft],
    crew: d[COLMAP_INDEX.saci.crew],
    studentCanac: getCanacSaci(d[COLMAP_INDEX.saci.crew]),
    dep: d[COLMAP_INDEX.saci.dep],
    arr: d[COLMAP_INDEX.saci.arr],
    tTotal: saciTimeToDecimal(d[COLMAP_INDEX.saci.tDay]) + saciTimeToDecimal(d[COLMAP_INDEX.saci.tNight]),
    tDay: saciTimeToDecimal(d[COLMAP_INDEX.saci.tDay]),
    tNight: saciTimeToDecimal(d[COLMAP_INDEX.saci.tNight]),
    tNav: saciTimeToDecimal(d[COLMAP_INDEX.saci.tNav]),
    tIFR: saciTimeToDecimal(d[COLMAP_INDEX.saci.tIFR]),
    tCapt: saciTimeToDecimal(d[COLMAP_INDEX.saci.tCapt]),
    ldg: Number(d[COLMAP_INDEX.saci.ldg]),
    NM: Number(d[COLMAP_INDEX.saci.NM].replace(',', '.').trim()),
    func: d[COLMAP_INDEX.saci.func].trim(),
    obs: d[COLMAP_INDEX.saci.obs].trim(),
    status: d[COLMAP_INDEX.saci.status].trim(),
    reg: d[COLMAP_INDEX.saci.reg].trim(),
    exclusionDate: d[COLMAP_INDEX.saci.exclusionDate].trim(),
    excludedBy: d[COLMAP_INDEX.saci.excludedBy].trim()
  }});
}


export const saasToData = (saas: string): SAASData[] => {
  const arr = JSON.parse(saas) as string[][]
  arr[0].push('id')

  for (let i = 1; i < arr.length; i++) {
    arr[i].push(uniqid())
  }

  const header = arr.shift();
  arr.sort((a, b) => dayjs(a[COLMAP_INDEX.saas.date], 'DD/MM/YYYY').toDate().getTime() > dayjs(b[COLMAP_INDEX.saas.date], 'DD/MM/YYYY').toDate().getTime() ? -1 : 1)
  return toJson({
    header,
    data: arr,
  }, 'saas')
}

export const saciToData = async (saci: string, excel: boolean): Promise<SACIData[]> => {
  if (!excel) return toJson(await saciCSVToData(saci), 'saci');
  return toJson(await saciXLTToData(saci), 'saci');
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
  return groupedData
}