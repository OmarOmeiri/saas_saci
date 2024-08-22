import writeXlsxFile, { SheetData } from 'write-excel-file'

const getCellType = (value: unknown) => {
  const castValue = Number.isNaN(Number(value))
  ? value
  : Number(value);
  switch(typeof castValue) {
    case 'number':
      return Number;
    default:
      return String;
  }
}

export function JSONToXlsx<T extends Record<PropertyKey, unknown>>(data: T[], headers: (keyof T)[]) {
  const HEADER_ROW: SheetData[number] = headers.map((h) => ({value: h as string, fontWeight: 'bold'}));

  const DATA: SheetData = data.map(r => (
    headers.map(h => {
      const C = getCellType(r[h]);
      return {type: C, value: C(r[h])}
    })
  ));

  DATA.unshift(HEADER_ROW)

  return writeXlsxFile(DATA, {
    columns: [
      { width: 35 },
      {},
      {}
    ]
  })
}