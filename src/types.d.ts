type TCSVData = {header: string[], data: string[][]}

type SAASData = {
  id: string;
  date: Date;
  acft: string;
  crew: string;
  studentCanac: string;
  dep: string;
  arr: string;
  tTotal: number;
  tDay: number;
  tNight: number;
  tNav: number;
  tIFR: number;
  tCapt: number;
  ldg: number;
  NM: number;
};

type SACIData = {
  id: string;
  date: Date;
  acft: string;
  crew: string;
  studentCanac: string;
  dep: string;
  arr: string;
  tTotal: number;
  tDay: number;
  tNight: number;
  tNav: number;
  tIFR: number;
  tCapt: number;
  ldg: number;
  NM: number;
  func: string;
  obs: string;
  status: string;
  reg: string;
  exclusionDate: string;
  excludedBy: string;
}