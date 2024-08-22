import { groupBy } from "lodash";

const getStudentNameFromSaas = (canac: string, saas: SAASData[]) => {
  const student = saas.find((d) => d.studentCanac === canac)
  return student ? student.crew || '-' : '-'
}

export const getNotRegisteredStudents = async (saci: SACIData[], saas: SAASData[]) => {
  const { JSONToXlsx } = await import("./Xl");
  const notRegistered = saci.filter((d) => d.status.trim().toLowerCase() === 'rascunho');
  
  const byStudent = groupBy(notRegistered, (d) => d.studentCanac.replace(/[^\d]+/g, ''))
  
  const toExportData = Object.entries(byStudent)
  .reduce((data, [canac, canacLines]) => {
    const hours = canacLines.reduce((sum, cline) => {
      sum += cline.tDay + cline.tNight;
      return sum;
    }, 0)
    const name = getStudentNameFromSaas(canac, saas);
    data.push({name, canac, hours});

    return data;
  }, [] as {canac: string, hours: number, name: string}[])
  .sort((a, b) => a.hours > b.hours ? -1 : 1) 
  // return jsonToCSV(toExportData, {delimiter: ';'});
  return JSONToXlsx(toExportData, ['name', 'canac', 'hours'])
}