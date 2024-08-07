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
