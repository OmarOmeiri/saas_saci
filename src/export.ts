import { groupBy } from "lodash";

const getStudentNameFromSaas = (canac: string, saas: SAASData[]) => {
  const student = saas.find((d) => d.canac === canac)
  return student ? student.crew || '-' : '-'
}

const formatDate = (d: SACIData) => {
  const vals = [String(d.date.getDate()), String(d.date.getMonth() + 1), String(d.date.getFullYear())]

  return {
    ...d,
    date: `${vals[0].padStart(2,'0')}/${vals[1].padStart(2,'0')}/${vals[2]}`
  }
}

export const getNotRegisteredStudents = async (saci: SACIData[], saas: SAASData[]) => {
  const { JSONToXlsx } = await import("./Xl");
  const notRegistered = saci.filter((d) => d.reg.trim().toLowerCase() === 'rascunho')
  .map(d => {
    const name = getStudentNameFromSaas(d.canac, saas);
    return {...d, name}
  });
  
  const byStudent = groupBy(notRegistered, (d) => d.canac.replace(/[^\d]+/g, ''))
  
  const toExportDataGrouped = Object.entries(byStudent)
  .reduce((data, [canac, canacLines]) => {
    const hours = canacLines.reduce((sum, cline) => {
      sum += cline.tDay + cline.tNight;
      return sum;
    }, 0)
    // const name = getStudentNameFromSaas(canac, saas);
    data.push({name: canacLines[0].name, canac, hours});

    return data;
  }, [] as {canac: string, hours: number, name: string}[])
  .sort((a, b) => a.hours > b.hours ? -1 : 1) 

  return JSONToXlsx([
    {
      data: notRegistered.map(formatDate),
      headers: ['date', 'acft', 'name', 'tDay', 'tNight', 'tTotal', 'ldg', 'nm', 'reg'],
      headerTranslate: ['DATA', 'ACFT', 'NOME', 'DIU', 'NOT', 'TOTAL', 'LDG', 'NM', 'REG'],
      sheetName: 'VOOS'
    },
    {
      data: toExportDataGrouped,
      headers: ['name', 'canac', 'hours'],
      headerTranslate: ['NOME', 'CANAC', 'HORAS'],
      sheetName: 'AGRUPADO'
    }
  ])
}