import Papa from 'papaparse';

const universalBOM = "\uFEFF";

export const csvToArray = async (csv: string): Promise<string[][]> => {
  let results: string[][] = [];

  Papa.parse(csv, {
        dynamicTyping: false,
        header: false,
        comments: "*=",
        complete: function(data) {
          results = data.data as string[][]
        }
  });
  return results
};

export const jsonToCSV = (json: Record<PropertyKey, unknown>[], config?: Papa.UnparseConfig): string => {
  const csv = Papa.unparse(json, config);
  return `${universalBOM}${csv}`
};