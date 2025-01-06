import { groupBy, isEqual } from "lodash";
import { arrayDiff } from "./utils";
import { CONFIG } from "./consts";

export type TDivergence = {id: string, msg: string}
export type TDivergences = {id: string, msg: string[]}

const noIdAndNm = (o: TCompare) => {
  const d = {...o};
  delete d.id;
  delete d.nm;
  return d;
}


const getSaasCompareData = (saas: SAASData[]) => (
  saas.map(sd => {
    const toCompare = {
      date: sd.date,
      canac: sd.canac,
      dep: sd.dep.split(',').length > 1 ? sd.dep.split(',').sort().join(',') : sd.dep,
      arr: sd.arr.split(',').length > 1 ? sd.arr.split(',').sort().join(',') : sd.arr,
      mat: sd.acft,
      tTotal: sd.tTotal,
      tDay: sd.tDay,
      tNight: sd.tNight,
      tNav: sd.tNav,
      tIFR: sd.tIFR,
      tCapt: sd.tCapt,
      ldg: sd.ldg,
      nm: sd.nm,
      id: sd.id
    }

    Object.entries(CONFIG.columnsToCompare).forEach(([k, v]) => {
      const key = k as unknown as keyof typeof toCompare;
      if (!v) {
        delete toCompare[key]
      }
    });
    return toCompare;
  })
);

const getSaciCompareData = (saci: SACIData[]): TCompare[] => (
  saci.map(sd => {
    const toCompare = {
      date: sd.date,
      canac: sd.canac,
      dep: sd.dep.split(',').length > 1 ? sd.dep.split(',').sort().join(',') : sd.dep,
      arr: sd.arr.split(',').length > 1 ? sd.arr.split(',').sort().join(',') : sd.arr,
      mat: sd.acft,
      tTotal: sd.tTotal,
      tDay: sd.tDay,
      tNight: sd.tNight,
      tNav: sd.tNav,
      tIFR: sd.tIFR,
      tCapt: sd.tCapt,
      ldg: sd.ldg,
      nm: sd.nm,
      id: sd.id
    }

    Object.entries(CONFIG.columnsToCompare).forEach(([k, v]) => {
      const key = k as unknown as keyof typeof toCompare;
      if (!v) delete toCompare[key]
    });
    return toCompare;
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
    const found = saciDayData.find((s) => {
      
      if (
        isEqual(noIdAndNm(s), noIdAndNm(saasLine))
        && !foundSaciIds.has(s.id)
      ) {
        if (!CONFIG.columnsToCompare.nm) return true;
        if (Math.abs(s.nm - saasLine.nm) > CONFIG.nmTolerance) return false
        return true;
      }
      return false;
    });

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


export const compareData = (saci: SACIData[], saas: SAASData[]) => {
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