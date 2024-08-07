import dayjs from "dayjs";
import { groupBy } from "lodash";
import { arrayOuterJoin, countArrFrequency, saciTimeToDecimal } from "./utils";
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

const checkStudentDivergences = (saasDayData: TCompare[], saciDayData: TCompare[]) => {
  const saasDayStudents = saasDayData.map(d => d.canac);
  const saciDayStudents = saciDayData.map(d => d.canac);
  const saasFreq = countArrFrequency(saasDayStudents)
  const saciFreq = countArrFrequency(saciDayStudents)
  const studentKeyDivergences = arrayOuterJoin(Object.keys(saasFreq), Object.keys(saciFreq));
  const studentFreqDivergences: string[] = []
  for (const key of Array.from(new Set([...Object.keys(saasFreq), ...Object.keys(saciFreq)]))) {
    if (saasFreq[key] === saciFreq[key]) continue;
    studentFreqDivergences.push(key)
  }

  return saasDayData.reduce((divergIds, d) => {
    if (
      studentFreqDivergences.includes(d.canac)
      || studentKeyDivergences.includes(d.canac)
    ) divergIds.push({id: d.id, msg: 'Este voo não está cadastrado no SACI.'});
    return divergIds;
  }, [] as TDivergence[])
};

const checkTDayDivergences = (saasDayData: TCompare[], saciDayData: TCompare[]) => {
  const saasDayTime = saasDayData.map(d => d.tDay);
  const saciDayTime = saciDayData.map(d => d.tDay);
  const saasFreq = countArrFrequency(saasDayTime)
  const saciFreq = countArrFrequency(saciDayTime)
  const keyDivergences = arrayOuterJoin(Object.keys(saasFreq), Object.keys(saciFreq));
  const freqDivergences: string[] = []
  for (const key of Array.from(new Set([...Object.keys(saasFreq), ...Object.keys(saciFreq)]))) {
    if (saasFreq[key as unknown as number] === saciFreq[key as unknown as number]) continue;
    freqDivergences.push(key)
  }

  return saasDayData.reduce((divergIds, d) => {
    if (
      freqDivergences.includes(d.canac)
      || keyDivergences.includes(d.canac)
    ) divergIds.push({id: d.id, msg: 'Este voo esta com divergência no tempo DIURNO.'});
    return divergIds;
  }, [] as TDivergence[])
};

const checkTNightDivergences = (saasDayData: TCompare[], saciDayData: TCompare[]) => {
  const saasNIghtTime = saasDayData.map(d => d.tNight);
  const saciNightTime = saciDayData.map(d => d.tNight);
  const saasFreq = countArrFrequency(saasNIghtTime)
  const saciFreq = countArrFrequency(saciNightTime)
  const keyDivergences = arrayOuterJoin(Object.keys(saasFreq), Object.keys(saciFreq));
  const freqDivergences: string[] = []
  for (const key of Array.from(new Set([...Object.keys(saasFreq), ...Object.keys(saciFreq)]))) {
    if (saasFreq[key as unknown as number] === saciFreq[key as unknown as number]) continue;
    freqDivergences.push(key)
  }

  return saasDayData.reduce((divergIds, d) => {
    if (
      freqDivergences.includes(d.canac)
      || keyDivergences.includes(d.canac)
    ) divergIds.push({id: d.id, msg: 'Este voo esta com divergência no tempo NOTURNO.'});
    return divergIds;
  }, [] as TDivergence[])
};

const checkTNavDivergences = (saasDayData: TCompare[], saciDayData: TCompare[]) => {
  const saasNavTime = saasDayData.map(d => d.tNav);
  const saciNavTime = saciDayData.map(d => d.tNav);
  const saasFreq = countArrFrequency(saasNavTime)
  const saciFreq = countArrFrequency(saciNavTime)
  const keyDivergences = arrayOuterJoin(Object.keys(saasFreq), Object.keys(saciFreq));
  const freqDivergences: string[] = []
  for (const key of Array.from(new Set([...Object.keys(saasFreq), ...Object.keys(saciFreq)]))) {
    if (saasFreq[key as unknown as number] === saciFreq[key as unknown as number]) continue;
    freqDivergences.push(key)
  }

  return saasDayData.reduce((divergIds, d) => {
    if (
      freqDivergences.includes(d.canac)
      || keyDivergences.includes(d.canac)
    ) divergIds.push({id: d.id, msg: 'Este voo esta com divergência no tempo NAV.'});
    return divergIds;
  }, [] as TDivergence[])
};

const checkLdgDivergences = (saasDayData: TCompare[], saciDayData: TCompare[]) => {
  const saasLdgs = saasDayData.map(d => d.ldg);
  const saciLdgs = saciDayData.map(d => d.ldg);
  const saasFreq = countArrFrequency(saasLdgs)
  const saciFreq = countArrFrequency(saciLdgs)
  const keyDivergences = arrayOuterJoin(Object.keys(saasFreq), Object.keys(saciFreq));
  const freqDivergences: string[] = []
  for (const key of Array.from(new Set([...Object.keys(saasFreq), ...Object.keys(saciFreq)]))) {
    if (saasFreq[key as unknown as number] === saciFreq[key as unknown as number]) continue;
    freqDivergences.push(key)
  }

  return saasDayData.reduce((divergIds, d) => {
    if (
      freqDivergences.includes(d.canac)
      || keyDivergences.includes(d.canac)
    ) divergIds.push({id: d.id, msg: 'Este voo esta com divergência no número de pousos.'});
    return divergIds;
  }, [] as TDivergence[])
};

const checkMatDivergences = (saasDayData: TCompare[], saciDayData: TCompare[]) => {
  const saasMat = saasDayData.map(d => d.mat);
  const saciMat = saciDayData.map(d => d.mat);
  const saasFreq = countArrFrequency(saasMat)
  const saciFreq = countArrFrequency(saciMat)
  const keyDivergences = arrayOuterJoin(Object.keys(saasFreq), Object.keys(saciFreq));
  const freqDivergences: string[] = []
  for (const key of Array.from(new Set([...Object.keys(saasFreq), ...Object.keys(saciFreq)]))) {
    if (saasFreq[key as unknown as number] === saciFreq[key as unknown as number]) continue;
    freqDivergences.push(key)
  }

  return saasDayData.reduce((divergIds, d) => {
    if (
      freqDivergences.includes(d.canac)
      || keyDivergences.includes(d.canac)
    ) divergIds.push({id: d.id, msg: 'Este voo esta com divergência na matrícula.'});
    return divergIds;
  }, [] as TDivergence[])
};

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

    divergences.push(...checkStudentDivergences(saasDayData, saciDayData));
    divergences.push(...checkTDayDivergences(saasDayData, saciDayData));
    divergences.push(...checkTNightDivergences(saasDayData, saciDayData));
    divergences.push(...checkTNavDivergences(saasDayData, saciDayData));
    divergences.push(...checkLdgDivergences(saasDayData, saciDayData));
    divergences.push(...checkMatDivergences(saasDayData, saciDayData));
  }
  
  return Object.values(groupBy(divergences, (d) => d.id))
  .reduce((ids, id) => {
    const msgs = id.map((i) => i.msg);
    ids.push({id: id[0].id, msg: msgs})
    return ids
  }, [] as TDivergences[]);
}