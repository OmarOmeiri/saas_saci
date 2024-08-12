import './app.css';
import "toastmaker/dist/toastmaker.css";
import { makeTable } from './tables'
import { saasToData, saciToData } from './data';
import { compareData } from './compare';
import { getNotRegisteredStudents } from './export';
import { copyToClipboard, download } from './utils';
import { SAAS_CODE } from './consts';
import { showToast } from './toast';
import { makeCompareSelectionTable } from './selectionTable';



let saci: SACIData[];
let saas: SAASData[];

function main(): void {
    const upldSaasBtn = document.querySelector("#upld-saas");
    const upldSaciBtn = document.querySelector("#upld-saci");
    const compareBtn = document.querySelector("#compare-btn");
    const exportBtn = document.querySelector("#export-students-btn");
    const downloadSAASCodeBtn = document.querySelector("#download-saas-btn");
    const compareSelectionBtn = document.querySelector("#compare-selection-btn");
    const closeDialogBtn = document.querySelector("#close-dialog-btn");
    
    
    upldSaasBtn?.addEventListener("click", updlSaasBtnHandler);
    upldSaciBtn?.addEventListener("click", updlSaciBtnHandler);
    compareBtn?.addEventListener("click", compareBtnHandler);
    exportBtn?.addEventListener("click", exportStudentsBtnHandler);
    downloadSAASCodeBtn?.addEventListener("click", downloadSAASCodeBtnHandler);
    compareSelectionBtn?.addEventListener("click", compareSelectionBtnHandler);
    closeDialogBtn?.addEventListener("click", closeDialogBtnHandler);
    document.addEventListener('click', onDocumentClickHandler)
}

function onDocumentClickHandler() {
  const compareSelectionBtn = document.getElementById('compare-selection-btn');
  const highlights = document.getElementsByClassName('highlight-tr');
  if (highlights.length === 2) {
    compareSelectionBtn.style.removeProperty('display');
  } else {
    compareSelectionBtn.style.display = 'none';
  }
}

function compareSelectionBtnHandler() {
  const dialog = document.getElementById("favDialog") as HTMLDialogElement;
  if (!dialog) return;
  if (dialog.open) {
    return;
  }
  const dialogContent = dialog.querySelector('#dialog-content');
  const compareTable = makeCompareSelectionTable();
  dialogContent.replaceChildren(...[compareTable]);

  dialog.showModal();
}

function closeDialogBtnHandler() {
  const dialog = document.getElementById("favDialog") as HTMLDialogElement;
  if (!dialog) return;
  if (dialog.open) {
    dialog.close();
    const dialogContent = dialog.querySelector('#dialog-content');
    dialogContent.replaceChildren();
  }
}

function updlSaciBtnHandler(e: MouseEvent): void {
  e.preventDefault();
  const input = document.createElement("input");
  input.type = "file";
  input.setAttribute("accept", ".csv, .xlt");
  input.onchange = async function (event: InputEvent) {
    const target = event.target as HTMLInputElement;
    const file = target.files.item(0);
    const decoded = new TextDecoder('iso-8859-1').decode(await file.arrayBuffer());
    const data = await saciToData(decoded, file.name.endsWith('.xlt'));
    makeTable(data, 'saci-tbl');
    saci = data;
  };
  input.click();
}

function updlSaasBtnHandler(e: MouseEvent): void {
  e.preventDefault();
  const input = document.createElement("input");
  input.type = "file";
  input.setAttribute("accept", ".txt");
  input.onchange = async function (event: InputEvent) {
    const data = saasToData(await (event.target as HTMLInputElement ).files.item(0).text());
    makeTable(data, 'saas-tbl');
    saas = data;
  };
  input.click();
}

function downloadSAASCodeBtnHandler(e: MouseEvent): void {
  e.preventDefault();
  copyToClipboard(SAAS_CODE);
  showToast('Códido copiado!');
}

function divergentTrMouseEnterHandler(e: MouseEvent): void {
  e.preventDefault();
  const target = e.target as HTMLTableRowElement;
  
  const msgAttr = (e.target as HTMLElement).getAttribute('data-msg');
  const tooltip = document.getElementById('tooltip');
  if (msgAttr && tooltip) {
    const msgs = JSON.parse(msgAttr) as string[];
    tooltip.classList.add('tooltip-show');
    tooltip.innerText = msgs.join('\n');
    const rect = target.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 15}px`;
  }
}

function divergentTrMouseLeaveHandler(e: MouseEvent): void {
  e.preventDefault();
  const tooltip = document.getElementById('tooltip');
  if (tooltip) {
    tooltip.classList.remove('tooltip-show');
    tooltip.innerText = '';
  }
}

function hasDataCheck(which: 'full' | 'saci' | 'saas' = 'full') {
  if (which === 'full' && !saas && !saci) {
    alert(`Faça o upload dos dados.`);
    return false;
  }
  if ((which === 'full' || which === 'saas') && !saas) {
    alert(`Faça o upload dos dados do SAAS.`);
    return false;
  }
  if ((which === 'full' || which === 'saci') && !saci) {
    alert(`Faça o upload dos dados do SACI.`);
    return false;
  }
  return true;
}

function exportStudentsBtnHandler() {
  if (!hasDataCheck()) return;
  const notRegistered = getNotRegisteredStudents(saci, saas)
  download(notRegistered, 'alunos_n_registrados.csv');
}

function compareBtnHandler() {
  if (!hasDataCheck()) return;

  const divergentIds = compareData(saci, saas);
  if (!divergentIds.length) {
    Array.from(document.querySelectorAll('#saas-tbl tr'))
      .forEach((tr) => tr.classList.remove('divergent-tr'))

    alert('Parabéns! nenhuma divergência foi encontrada.');
  }
  for (const divergentId of divergentIds) {
    const divergentTr = document.getElementById(divergentId.id);
    if (!divergentTr) {
      alert('Houve um erro ao comparar os dados.');
      return;
    }
    divergentTr.setAttribute('data-msg', JSON.stringify(divergentId.msg));
    divergentTr.classList.add('divergent-tr');
    divergentTr.addEventListener('mouseenter', divergentTrMouseEnterHandler)
    divergentTr.addEventListener('mouseleave', divergentTrMouseLeaveHandler)
  }
}

main();