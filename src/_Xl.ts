import JSZip from "jszip";



const makeRow = (cell: string, i: number, span: number) => (
  `<row r="${i}" spans="1:${span}">` +
  cell + 
  '</row>'
)

const getCell = (value: unknown) => (
  Number.isNaN(Number(value))
  ? '<c t="inlineStr">' +
    '<is>' +
    `<t>${String(value)}</t>` +
    '</is>' +
    '</c>'
  : `<c s="1">` +
    `<v>${String(value)}</v>` +
    '</c>'
);

const makeCell = (value: unknown | unknown[]) => (
  [value]
  .flat()
  .reduce((c, v) => {
    c = c + getCell(v);
    return c
  }, '') as string
)

const makeSheet = <T extends Record<PropertyKey, unknown>>(data: T[], headers: (keyof T)[]) => {
  const rows = [makeRow(makeCell(headers), 1, headers.length)];

  data.forEach((d, i) => {
    const row = makeRow(makeCell(headers.map(h => d[h])), i + 2, headers.length);
    rows.push(row);
  })

  const strRows = rows.reduce((rStr, row) => {
    rStr = rStr + row;
    return rStr
  }, '')


  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<worksheet xmlns="http://purl.oclc.org/ooxml/spreadsheetml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac xr xr2 xr3" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision" xmlns:xr2="http://schemas.microsoft.com/office/spreadsheetml/2015/revision2" xmlns:xr3="http://schemas.microsoft.com/office/spreadsheetml/2016/revision3" xr:uid="{7692402F-0706-4FB4-BC3D-F5CCF87FAADF}">' +
          '<dimension ref="A1"/>' +
          '<sheetViews>' +
          '<sheetView tabSelected="1" workbookViewId="0"/>' +
          '</sheetViews>' +
          '<sheetFormatPr defaultRowHeight="14.5"/>' +
          '<cols>' + 
          '<col min="1" max="1" width="33" bestFit="1" customWidth="1" />' +
          '</cols>' + 
          '<sheetData>' +
          strRows +
          '</sheetData>' +
          '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>' +
          '</worksheet>';


}

const makeWorkSheet = <T extends Record<PropertyKey, unknown>>(data: T[], headers: (keyof T)[]) => {
  const zip = new JSZip();

  zip.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>');

  const rels = zip.folder("_rels");
  rels.file(".rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://purl.oclc.org/ooxml/officeDocument/relationships/extendedProperties" Target="docProps/app.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId1" Type="http://purl.oclc.org/ooxml/officeDocument/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')


  const xl = zip.folder("xl");

  const xl_rels = xl.folder("_rels");
  xl_rels.file("workbook.xml.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://purl.oclc.org/ooxml/officeDocument/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://purl.oclc.org/ooxml/officeDocument/relationships/theme" Target="theme/theme1.xml"/><Relationship Id="rId1" Type="http://purl.oclc.org/ooxml/officeDocument/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');

  xl.file("styles.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<styleSheet xmlns="http://purl.oclc.org/ooxml/spreadsheetml/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac x16r2 xr" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:x16r2="http://schemas.microsoft.com/office/spreadsheetml/2015/02/main" xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision">' +
      '<fonts count="1"><font /></fonts>' +
      '<fills count="1"><fill /></fills>' +
      '<borders count="1"><border /></borders>' +
      '<cellStyleXfs count="1"><xf /></cellStyleXfs>' +
      '<cellXfs count="1"><xf /></cellXfs>' +
      '</styleSheet>');
  xl.file("workbook.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<workbook xmlns="http://purl.oclc.org/ooxml/spreadsheetml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x15 xr xr6 xr10 xr2" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main" xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision" xmlns:xr6="http://schemas.microsoft.com/office/spreadsheetml/2016/revision6" xmlns:xr10="http://schemas.microsoft.com/office/spreadsheetml/2016/revision10" xmlns:xr2="http://schemas.microsoft.com/office/spreadsheetml/2015/revision2" conformance="strict"><fileVersion appName="xl" lastEdited="7" lowestEdited="7" rupBuild="23801"/><workbookPr dateCompatibility="0" defaultThemeVersion="166925"/><mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><mc:Choice Requires="x15"><x15ac:absPath url="C:\\Users\\534223\\Desktop\\carlos project\\" xmlns:x15ac="http://schemas.microsoft.com/office/spreadsheetml/2010/11/ac"/></mc:Choice></mc:AlternateContent><xr:revisionPtr revIDLastSave="0" documentId="8_{3A289708-EEB4-4C61-80F8-0077D98C4C49}" xr6:coauthVersionLast="46" xr6:coauthVersionMax="46" xr10:uidLastSave="{00000000-0000-0000-0000-000000000000}"/><bookViews><workbookView xWindow="-108" yWindow="-108" windowWidth="23256" windowHeight="12576" xr2:uid="{7AE87E27-093C-4FCA-9244-038BA05B474C}"/></bookViews><sheets><sheet name="180 Days" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029"/><extLst><ext uri="{79F54976-1DA5-4618-B147-4CDE4B953A38}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main"><x14:workbookPr/></ext><ext uri="{140A7094-0E35-4892-8432-C4D2E57EDEB5}" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><x15:workbookPr chartTrackingRefBase="1"/></ext><ext uri="{B58B0392-4F1F-4190-BB64-5DF3571DCE5F}" xmlns:xcalcf="http://schemas.microsoft.com/office/spreadsheetml/2018/calcfeatures"><xcalcf:calcFeatures><xcalcf:feature name="microsoft.com:RD"/><xcalcf:feature name="microsoft.com:Single"/><xcalcf:feature name="microsoft.com:FV"/><xcalcf:feature name="microsoft.com:CNMTM"/><xcalcf:feature name="microsoft.com:LET_WF"/></xcalcf:calcFeatures></ext></extLst></workbook>');

  const worksheets = xl.folder("worksheets");
  worksheets.file("sheet1.xml", makeSheet(data, headers));

  return zip.generateAsync({type:"blob"});
}



export function JSONToXlsx<T extends Record<PropertyKey, unknown>>(data: T[], headers: (keyof T)[]) {
  return makeWorkSheet(data, headers);
}

// const sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
// '<worksheet xmlns="http://purl.oclc.org/ooxml/spreadsheetml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac xr xr2 xr3" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision" xmlns:xr2="http://schemas.microsoft.com/office/spreadsheetml/2015/revision2" xmlns:xr3="http://schemas.microsoft.com/office/spreadsheetml/2016/revision3" xr:uid="{7692402F-0706-4FB4-BC3D-F5CCF87FAADF}">' +
// '<dimension ref="A1"/>' +
// '<sheetViews>' +
// '<sheetView tabSelected="1" workbookViewId="0"/>' +
// '</sheetViews>' +
// '<sheetFormatPr defaultRowHeight="14.4" x14ac:dyDescent="0.3"/>' +
// '<sheetData>' +
// '<row>' +
// '<c t="inlineStr">' +
// '<is>' +
// '<t>Hello</t>' +
// '</is>' +
// '</c>' +
// '<c t="inlineStr">' +
// '<is>' +
// '<t>World</t>' +
// '</is>' +
// '</c>' +
// '</row>' +
// '</sheetData>' +
// '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>' +
// '</worksheet>';
// const test = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://purl.oclc.org/ooxml/spreadsheetml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac xr xr2 xr3" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision" xmlns:xr2="http://schemas.microsoft.com/office/spreadsheetml/2015/revision2" xmlns:xr3="http://schemas.microsoft.com/office/spreadsheetml/2016/revision3" xr:uid="{7692402F-0706-4FB4-BC3D-F5CCF87FAADF}"><dimension ref="A1"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="14.4" x14ac:dyDescent="0.3"/><sheetData><row><c t="inlineStr"><is><t>Hello</t></is></c><c t="inlineStr"><is><t>World</t></is></c></row></sheetData><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>';
