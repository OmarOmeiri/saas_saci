import { groupBy } from "lodash";
import { TData } from ".";
import { saciTimeToDecimal } from "./utils";
import { jsonToCSV } from "./CSV";

const getStudentNameFromSaas = (canac: string, saas: TData) => {
  const student = (saas.data.find((d) => d[2].includes(canac))) || []
  return student[2] || '-'
}

export const getNotRegisteredStudents = (saci: TData, saas: TData) => {
  const statusColIndex = saci.header.findIndex((h) => h.trim().toLowerCase() === 'status');
  if (statusColIndex < 0) {
    alert('Houve um erro ao exportar: Coluna Status não encontrada!');
  }
  const notRegistered = saci.data.filter((d) => d[statusColIndex].trim().toLowerCase() === 'rascunho');
  

  const canacColIndex = saci.header.findIndex((h) => h.trim().toLowerCase().includes('canac'));
  if (canacColIndex < 0) {
    alert('Houve um erro ao exportar: Coluna CANAC não encontrada!');
  }

  const dTimeColIndex = saci.header.findIndex((h) => h.trim().toLowerCase().includes('diurno'));
  if (dTimeColIndex < 0) {
    alert('Houve um erro ao exportar: Coluna DIURNO não encontrada!');
  }

  const nTimeColIndex = saci.header.findIndex((h) => h.trim().toLowerCase().includes('noturno'));
  if (nTimeColIndex < 0) {
    alert('Houve um erro ao exportar: Coluna NOTURNO não encontrada!');
  }

  const byStudent = groupBy(notRegistered, (d) => d[canacColIndex].replace(/[^\d]+/g, ''))
  
  const toExportData = Object.entries(byStudent)
  .reduce((data, [canac, canacLines]) => {
    const hours = canacLines.reduce((sum, cline) => {
      sum += (saciTimeToDecimal(cline[dTimeColIndex]) + saciTimeToDecimal(cline[nTimeColIndex]));
      return sum;
    }, 0)
    const name = getStudentNameFromSaas(canac, saas);
    data.push({name, canac, hours});

    return data;
  }, [] as {canac: string, hours: number, name: string}[])
  .sort((a, b) => a.hours > b.hours ? -1 : 1) 
  return jsonToCSV(toExportData);
}