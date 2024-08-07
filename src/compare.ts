import dayjs from "dayjs";
import { groupBy, isEqual } from "lodash";
import { arrayDiff, saciTimeToDecimal } from "./utils";
import { TData } from ".";

type TCompare = {
  date: Date;
  canac: string;
  mat: string;
  tDay: number;
  tNight: number;
  tNav: number;
  ldg: number;
  id: string;
}

export type TDivergence = {id: string, msg: string}
export type TDivergences = {id: string, msg: string[]}

const noId = (o: TCompare) => {
  const d = {...o};
  delete d.id;
  return d;
}

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

const getSaasCompareData = (saas: TData): TCompare[] => (
  saas.data.map(sd => {
    const date = dayjs(sd[1], 'DD/MM/YYYY').toDate();
    const canac = getCanacSaas(sd[2]);
    const mat = sd[4].replace('-', '').trim();
    const tDay = Number(sd[7]);
    const tNight = Number(sd[8]);
    const tNav = Number(sd[9]);
    const ldg = Number(sd[12]);
    return {
      date,
      canac,
      mat,
      tDay,
      tNight,
      tNav,
      ldg,
      id: sd[sd.length - 1]
    }
  })
);

const getSaciCompareData = (saci: TData): TCompare[] => (
  saci.data.map(sd => {
    const date = dayjs(sd[0], 'D/M/YYYY').toDate();
    const canac = getCanacSaci(sd[3]);
    const mat = sd[1].replace('-', '').trim();
    const tDay = saciTimeToDecimal(sd[9]);
    const tNight = saciTimeToDecimal(sd[10]);
    const tNav = saciTimeToDecimal(sd[11]);
    const ldg = Number(sd[4]);
    return {
      date,
      canac,
      mat,
      tDay,
      tNight,
      tNav,
      ldg,
      id: sd[sd.length - 1]
    }
  })
)

const checkDateDivergences = (saasDayData: TCompare[], saciDayData: TCompare[]) => {
  if (Array.isArray(saasDayData) && Array.isArray(saciDayData)) return null;
  if (!saasDayData) return null;

  return saasDayData.reduce((divergIds, d) => {
    divergIds.push({id: d.id, msg: 'Este voo não está cadastrado no SACI.'});
    return divergIds;
  }, [] as TDivergence[])
};

const checkIfAllFlightsAreRegistered = (saasDayData: TCompare[], saciDayData: TCompare[]): {notFoundIds: string[], divergences: TDivergence[]} => {
  const foundSaciIds: Set<string> = new Set();
  const foundSaasIds: Set<string> = new Set();
  const allSaasIds = saasDayData.map(d => d.id);
  for (const saasLine of saasDayData) {
    const found = saciDayData.find((s) => (
      isEqual(noId(s), noId(saasLine))
      && !foundSaciIds.has(s.id)
    ));

    if (found) {
      foundSaciIds.add(found.id);
      foundSaasIds.add(saasLine.id);
    }
  }

  const notFoundIds = arrayDiff(allSaasIds, Array.from(foundSaasIds));
  if (notFoundIds.length) {
    console.log('saasDayData: ', saasDayData);
    console.log('saciDayData: ', saciDayData);
  }

  return {notFoundIds, divergences: notFoundIds.map(id => ({id, msg: 'Este voo não está cadastrado no SACI.'}))}
}


export const compareData = (saci: TData, saas: TData) => {
  const saasCData = getSaasCompareData(saas);
  const saciCData = getSaciCompareData(saci);

  const saasByDay = groupBy(saasCData, (d) => d.date);
  const saciByDay = groupBy(saciCData, (d) => d.date);

  const divergences: TDivergence[] = [];

  for (const saasDay of Object.keys(saasByDay)) {
    const saasDayData = saasByDay[saasDay];
    const saciDayData = saciByDay[saasDay];

    const dateDivergences = checkDateDivergences(saasDayData, saciDayData);
    if (dateDivergences) {
      divergences.push(...dateDivergences);
      continue;
    }

    const notRegisteredFlights = checkIfAllFlightsAreRegistered(saasDayData, saciDayData);

    divergences.push(...notRegisteredFlights.divergences);
  }
  
  return Object.values(groupBy(divergences, (d) => d.id))
  .reduce((ids, id) => {
    const msgs = id.map((i) => i.msg);
    ids.push({id: id[0].id, msg: msgs})
    return ids
  }, [] as TDivergences[]);
}