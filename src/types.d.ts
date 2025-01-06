type TCSVData = {header: string[], data: string[][]}

type SAASData = {
  id: string;
  date: Date;
  acft: string;
  crew: string;
  canac: string;
  dep: string;
  arr: string;
  tTotal: number;
  tDay: number;
  tNight: number;
  tNav: number;
  tIFR: number;
  tCapt: number;
  ldg: number;
  nm: number;
};

type SACIData = {
  id: string;
  date: Date;
  acft: string;
  crew: string;
  canac: string;
  dep: string;
  arr: string;
  tTotal: number;
  tDay: number;
  tNight: number;
  tNav: number;
  tIFR: number;
  tCapt: number;
  ldg: number;
  nm: number;
  func: string;
  obs: string;
  status: string;
  reg: string;
  exclusionDate: string;
  excludedBy: string;
}

type TCompare = {
  date: Date;
  canac: string;
  dep: string;
  arr: string;
  mat: string;
  tTotal: number;
  tDay: number;
  tNight: number;
  tNav: number;
  tIFR: number;
  tCapt: number;
  ldg: number;
  nm: number;
  id: string;
}