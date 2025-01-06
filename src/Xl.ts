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


export function JSONToXlsx(data: {data: Record<string, unknown>[], headers: string[], headerTranslate?: string[], sheetName: string}[]) {
  const DATA = data.map((d) => {
    const HEADER_ROW: SheetData[number] = (d.headerTranslate || d.headers).map((h) => ({value: h as string, fontWeight: 'bold'}));

    const DATA: SheetData = d.data.map(r => (
      d.headers.map(h => {
        const C = getCellType(r[h]);
        return {type: C, value: C(r[h])}
      })
    ));
  
    DATA.unshift(HEADER_ROW)
    return {DATA, sheetName: d.sheetName}
  });



  return writeXlsxFile(DATA.map(d => d.DATA), {
    columns: [[
      {width: 12},
      {},
      {width: 40},
      {},
      {},
      {},
      {},
      {},
      {width: 12},
    ],
    [
      { width: 40 },
      {},
      {}
    ]],
    sheets: DATA.map(d => d.sheetName),
    dateFormat: 'dd/mm/yyyy'
  })
  
}