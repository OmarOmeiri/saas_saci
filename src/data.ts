import uniqid from 'uniqid';
import { csvToArray } from './CSV';
import { strIsDate } from './utils';
import { TData } from './index';

export const saasToData = (saas: string): TData => {
  const arr = JSON.parse(saas) as string[][]
  arr[0].push('id')

  for (let i = 1; i < arr.length; i++) {
    arr[i].push(uniqid())
  }

  const header = arr.shift();
  return {
    header,
    data: arr,
  }
}

export const saciToData = async (saci: string): Promise<TData> => {
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