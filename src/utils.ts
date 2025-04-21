import dayjs from "dayjs"
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { isEqual, uniqBy } from "lodash"
import { COL_ORDER } from "./consts";

dayjs.extend(customParseFormat)

export const strIsDate = (dateStr: string, format: dayjs.OptionType) => (
  !isNaN(dayjs(dateStr, format).toDate().getDate())
)

export const countArrFrequency = <T extends string | number>(arr: Array<T>) => {
  //@ts-expect-error jskjks
  const count: Record<T, number> = {};
 
  for (let i = 0; i < arr.length; i++) {
      const ele = arr[i];
      if (count[ele]) {
          count[ele] += 1;
      } else {
          count[ele] = 1;
      }
  }
  return count;
}

/**
 * Returns the outer join of two arrays.
 * @param arr1
 * @param arr2
 * @returns the elements that are not in both arrays
 */
export const arrayOuterJoin = <T>(arr1: T[], arr2: T[]): T[] => {
  return [
    ...arr1.filter((x) => !arr2.some((y) => isEqual(x, y))),
    ...arr2.filter((x) => !arr1.some((y) => isEqual(x, y))),
  ];
};

/**
 * Returns the difference between two arrays.
 * @param arr1
 * @param arr2
 * @returns the elements that are in 'arr1' but not in 'arr2'
 */
export const arrayDiff = <T>(arr1: T[], arr2: T[]) => {
  return arr1.filter((x) => !arr2.some((y) => isEqual(x, y)));
};

export const saciTimeToDecimal = (str: string) => {
  const [h, m] = str.split(':').map(Number);
  if (m < 4) return h;
  if (m >= 4 && m <= 9) return h + 0.1;
  if (m >= 10 && m <= 15) return h + 0.2;
  if (m >= 16 && m <= 21) return h + 0.3;
  if (m >= 22 && m <= 27) return h + 0.4;
  if (m >= 28 && m <= 33) return h + 0.5;
  if (m >= 34 && m <= 39) return h + 0.6;
  if (m >= 40 && m <= 45) return h + 0.7;
  if (m >= 46 && m <= 51) return h + 0.8;
  if (m >= 52 && m <= 57) return h + 0.9;
  return h + 1
}


export const download = (data: string | Blob, name: string) => {
  const tempLink = document.createElement("a");
  const taBlob = typeof data === 'string'
    ? new Blob([data], {type: 'text/plain; charset=UTF8'})
    : data;
  tempLink.setAttribute('href', URL.createObjectURL(taBlob));
  tempLink.setAttribute('download', name);
  tempLink.click();
  
  URL.revokeObjectURL(tempLink.href);  
};

/**
 * Removes duplicates of an array of objects by a given UNIQUE key
 * @param objArr
 */
export function rmvObjDuplicatesByKey<T extends Record<string, unknown>[]>(objArr: T, key: string): T {
  return uniqBy(objArr, key) as unknown as T;
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);

  // // Alert the copied text
  // alert("Copied the text: " + copyText.value);
}

export function parentByTag(el: HTMLElement, tagName: string) {
  if(!el || el.tagName == tagName.toUpperCase()) {
      return el
  } else {
      return parentByTag(el.parentElement, tagName)
  }
}

export const decimalToTime = (t: string) => {
  if (Number.isNaN(Number(t))) {
    throw new Error('Não foi possivel copiar.')
  }
  const splt = t.split('.');
  const int = splt[0];
  const dec = Number(splt[1]) | 0;
  return `${String(int).padStart(2, '0')}:${String(dec * 6).padStart(2, '0')}`
}

export function copySaasLine(evt: ClipboardEvent) {
  const saasSelection = document.querySelector('#saas-tbl .highlight-tr') as HTMLTableRowElement;
  if (!saasSelection) return;
  evt.preventDefault();
  const saasChildren = Array.from(saasSelection.children) as HTMLElement[];
  const data = COL_ORDER.saas.slice(0, COL_ORDER.saas.length - 1).reduce((obj, col, i) => {
    if (COL_ORDER.saci.indexOf(col) < 0) return obj;
    obj[col] = saasChildren[i].innerText;
    return obj;
  }, {} as Record<keyof SAASData, string>);
  
  const copyData = {
    date: data.date,
    ldg: data.ldg,
    func: 1,
    canac: data.canac,
    nm: data.nm === '0' ? undefined : data.nm,
    acft: data.acft,
    dep: data.dep,
    arr: data.arr,
    tDay: data.tDay === '0' ? undefined : decimalToTime(data.tDay),
    tNight: data.tNight === '0' ? undefined : decimalToTime(data.tNight),
    tNav: data.tNav === '0' ? undefined : decimalToTime(data.tNav),
    tIFR: data.tIFR === '0' ? undefined : decimalToTime(data.tIFR),
    tCapt: data.tCapt === '0' ? undefined : decimalToTime(data.tCapt),
  };

  evt.clipboardData.setData('text/plain', JSON.stringify(copyData, undefined, 2));
}