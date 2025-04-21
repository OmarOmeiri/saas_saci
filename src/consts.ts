export const SAAS_CODE = `
/**
 * ESTE CÓDIGO FAZ O DOWNLOAD DOS DADOS DO RELATÓRIO DO SAAS EM FORMATO .TXT
 * 
 * COLE ESTE CÓDIGO NO CONSOLE OU EM UM SNIPPET NO GOOGLE CHROME
 * 
 * PARA QUE FUNCIONE, VOCÊ PRECISA ESTAR LOGADO NO SAAS E COM O RELATÓRIO ABERTO NA TELA
 */

const xPath = function (xpath) {
    const result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    let nodes = [];
    let node = result.iterateNext();
    while (node) {
        nodes.push(node);
        node = result.iterateNext();
    }
    return nodes;
};

const selectors = {
    table: '//table',
    thead: '//table/thead',
    tbody: '//table/tbody',
};

const getTableHeaders = () => {
    const [thead] = xPath(selectors.thead);
    return Array.from(thead.firstElementChild.children)
               .map(th => th.innerText);
    
};

const getTableData = () => {
    const [tbody] = xPath(selectors.tbody);
    const data = Array.from(tbody.children)
        .map((tr) => (
            Array.from(tr.children)
            .map((d) => d.innerText)
        ));
    data.pop();
    return data;
}

const save = (str) => {
    const tempLink = document.createElement("a");
    var taBlob = new Blob([str], {type: 'text/plain; charset=UTF8'});
    tempLink.setAttribute('href', URL.createObjectURL(taBlob));
    tempLink.setAttribute('download', \`voos_saas.txt\`);
    tempLink.click();
    
    URL.revokeObjectURL(tempLink.href);  
};

const run = () => {
    const headers = getTableHeaders();
    const tableData = getTableData();
    tableData.unshift(headers);
    save(JSON.stringify(tableData));
}

run();`;

export const TAMPERMONKEY_CODE = `
// ==UserScript==
// @name         SACI AutoFill
// @namespace    http://tampermonkey.net/
// @version      2025-04-20
// @description  try to take over the world!
// @author       Omar
// @match        *://sistemas.anac.gov.br/SACI/CIV/Digital/incluirCIV.asp
// @match        *://sistemas.anac.gov.br/SACI/CIV/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
const xpath = (xpath) => {
    const result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    let nodes = [];
    let node = result.iterateNext();
    while (node) {
        nodes.push(node);
        node = result.iterateNext();
    }
    return nodes;
}

const selectors = {
    date: '//input[@name="txtDataRegistroVoo"]',
    ldg: '//input[@name="txtPousos"]',
    func: '//select[@name="cmbFuncao"]',
    canac: '//input[@name="CD_ANAC_INSTRUENDO"]',
    nm: '//input[@name="txtQtMilhaNavegacao"]',
    acft: '//input[@name="txtMatricula"]',
    dep: '//input[@name="txtOrigem"]',
    arr: '//input[@name="txtDestino"]',
    tDay: '//input[@name="txtDiurno"]',
    tNight: '//input[@name="txtNoturno"]',
    tNav: '//input[@name="txtNavegacao"]',
    tIFR: '//input[@name="txtInstrumento"]',
    tCapt: '//input[@name="txtCapota"]'
};

const clearInputs = () => {
    for (const sel of Object.values(selectors)) {
        const elems = xpath(sel);
        if (!elems.length) continue;
        const elem = elems[0];
        if (elem.tagName = 'INPUT') {
            elem.value = '';
        }
    }
}

const fillForm = async () => {
    clearInputs();
    const text = await navigator.clipboard.readText();
    try {
        const flt = JSON.parse(text);
        //console.log(flt);
        for (const k of Object.keys(flt)) {
            if (!(k in selectors)) throw new Error(\`A key \${k} não foi encontrada.\`);
        }
        Object.entries(flt).forEach(([k, v]) => {
            const res = xpath(selectors[k]);
            if (!res) return;
            const [elem] = res;
            if (k === 'func') {
                elem.selectedIndex = 0;
                elem.onchange();
                return;
            }
            elem.value = v;
        });
    } catch (e) {
        console.error(e);
        alert('Não há voo copiado!')
    }
};

const addButton = () => {
    const hasBtn = document.getElementById('fill-btn');
    if (hasBtn) return;
    const btn = document.createElement('button');
    btn.id = 'fill-btn';
    btn.addEventListener('click', fillForm);
    btn.innerText = 'Preencher';
    btn.style.cssText = \`
    display: block;
    position: fixed;
    top: 0;
    padding: 10px;
    background-color: #eb7b7b;
\`;
    document.body.appendChild(btn)
}

(function() {
    'use strict';
    console.log('hey');
    addButton();
})();`;


export const COL_ORDER: {
  saci: (keyof SACIData)[],
  saas: (keyof SAASData)[]
} = {
  saci:[
    'date',
    'acft',
    'canac',
    'dep',
    'arr',
    'tTotal',
    'tDay',
    'tNight',
    'tNav',
    'tIFR',
    'tCapt',
    'ldg',
    'nm',
    'func',
    'obs',
    'status',
    'reg',
    'exclusionDate',
    'excludedBy',
    'id',
  ],
  saas: [
    'date',
    'acft',
    'crew',
    'canac',
    'dep',
    'arr',
    'tTotal',
    'tDay',
    'tNight',
    'tNav',
    'tIFR',
    'tCapt',
    'ldg',
    'nm',
    'id',
  ]
};

export const COLMAP_NAMES: {
  [K in keyof (SACIData & SAASData)]: string
} = {
  id: 'id',
  date: 'Data',
  acft: 'ACFT',
  crew: 'Tripulante',
  canac: 'CANAC',
  dep: 'Origem',
  arr: 'Destino',
  tTotal: 'Total',
  tDay: 'DIU',
  tNight: 'NOT',
  tNav: 'NAV',
  tIFR: 'INST',
  tCapt: 'CAPT',
  ldg: 'Pousos',
  nm: 'Milhas',
  func: 'Função',
  obs: 'OBS',
  status: 'Status',
  reg: 'Cadastrado',
  exclusionDate: 'Exclusão',
  excludedBy: 'Excluido por',
}

export const COLMAP_INDEX = {
  saci: {
    date: 0,
    acft: 1,
    crew: 4,
    dep: 6,
    arr: 7,
    tDay: 10,
    tNight: 11,
    tNav: 12,
    tIFR: 13,
    tCapt: 14,
    ldg: 5,
    NM: 16,
    func: 9,
    obs: 8,
    status: 18,
    reg: 19,
    exclusionDate: 20,
    excludedBy: 21,
  },
  saas: {
    date: 1,
    acft: 4,
    crew: 2,
    depArr: 5,
    tTotal: 6,
    tDay: 7,
    tNight: 8,
    tNav: 9,
    tIFR: 10,
    tCapt: 11,
    ldg: 12,
    NM: 13,
  },
}

export const CONFIG: {
  columnsToCompare: {[K in keyof Partial<TCompare>]: boolean},
  nmTolerance: number
} = {
  columnsToCompare: {
    canac: true,
    dep: true,
    arr: true,
    tTotal: true,
    tDay: true,
    tNight: true,
    tNav: true,
    tIFR: true,
    tCapt: true,
    ldg: true,
    nm: true,
  },
  nmTolerance: 15,
}