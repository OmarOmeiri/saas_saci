import Papa from 'papaparse';

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

export const jsonToCSV = (json: Record<PropertyKey, unknown>[]): string => {
  const csv = Papa.unparse(json);
  return csv
};