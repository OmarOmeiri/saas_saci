import dayjs from "dayjs"
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { isEqual } from "lodash"

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

export const saciTimeToDecimal = (str: string) => {
  const [h, m] = str.split(':').map(Number);
  if (m < 6) return h;
  if (m >= 6 && m < 12) return h + 0.1;
  if (m >= 12 && m < 18) return h + 0.2;
  if (m >= 18 && m < 24) return h + 0.3;
  if (m >= 24 && m < 30) return h + 0.4;
  if (m >= 30 && m < 36) return h + 0.5;
  if (m >= 36 && m < 42) return h + 0.6;
  if (m >= 42 && m < 48) return h + 0.7;
  if (m >= 48 && m < 54) return h + 0.8;
  if (m >= 54 && m < 60) return h + 0.9;
  return h
}


export const download = (str: string, name: string) => {
  const tempLink = document.createElement("a");
  const taBlob = new Blob([str], {type: 'text/plain; charset=UTF8'});
  tempLink.setAttribute('href', URL.createObjectURL(taBlob));
  tempLink.setAttribute('download', name);
  tempLink.click();
  
  URL.revokeObjectURL(tempLink.href);  
};