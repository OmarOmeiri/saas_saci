import './app.css';
import "toastmaker/dist/toastmaker.css";
import { makeTable } from './tables'
import { groupNavSaci, saasToData, saciToData } from './data';
import { compareData } from './compare';
import { getNotRegisteredStudents } from './export';
import { copyToClipboard, download, copySaasLine } from './utils';
import { SAAS_CODE, TAMPERMONKEY_CODE } from './consts';
import { showToast } from './toast';
import { makeCompareSelectionTable } from './selectionTable';
import { makeConfigDialogContent } from './configDialog';
import AttributeObserver from './AttibuteObserver';



let saciOriginal: SACIData[];
let saci: SACIData[];
let saas: SAASData[];

const upldSaasBtn = document.querySelector("#upld-saas");
const upldSaciBtn = document.querySelector("#upld-saci");
const compareBtn = document.querySelector("#compare-btn");
const exportBtn = document.querySelector("#export-students-btn");
const downloadSAASCodeBtn = document.querySelector("#download-saas-btn");
const downloadTPMCodeBtn = document.querySelector("#download-tpm-btn");
const compareSelectionBtn = document.querySelector("#compare-selection-btn");
const configBtn = document.querySelector("#config-btn");
const closeDialogBtn = document.querySelector("#close-dialog-btn");
const groupNavCheckbox = document.querySelector("#group-nav-checkbox") as HTMLInputElement;
const saasDataCount = (document.querySelector('.menu-saas small span:nth-child(1)') as HTMLElement | null);
const saciDataCount = (document.querySelector('.menu-saci small') as HTMLElement | null);
const saciDataCountDiverg = (document.querySelector('.menu-saas small span:nth-child(2)') as HTMLElement | null);
const dialog = document.getElementById('favDialog');

const dialogObserver = new AttributeObserver(dialog, onDialogAttributeChange);
dialogObserver.observe(['data-reload', 'open']);

function main(): void {
    upldSaasBtn?.addEventListener("click", updlSaasBtnHandler);
    upldSaciBtn?.addEventListener("click", updlSaciBtnHandler);
    compareBtn?.addEventListener("click", () => compareBtnHandler());
    exportBtn?.addEventListener("click", exportStudentsBtnHandler);
    downloadSAASCodeBtn?.addEventListener("click", downloadSAASCodeBtnHandler);
    downloadTPMCodeBtn?.addEventListener("click", downloadTPMCodeBtnHandler);
    compareSelectionBtn?.addEventListener("click", compareSelectionBtnHandler);
    closeDialogBtn?.addEventListener("click", closeDialogBtnHandler);
    groupNavCheckbox?.addEventListener("change", groupNavHandler);
    configBtn?.addEventListener("click", configBtnHandler);
    document.addEventListener('click', onDocumentClickHandler)
    document.addEventListener('copy', copySaasLine);
}

function onDialogAttributeChange(mutation: MutationRecord) {
  const target = mutation.target as HTMLDialogElement;
  const open = target.getAttribute('open') !== null;
  const reload = target.getAttribute('data-reload') === 'true';
  if (!open && reload) {
    compareBtnHandler(true);
    dialog.setAttribute('data-reload', 'false');
  }
}

function onDocumentClickHandler() {
  const compareSelectionBtn = document.getElementById('compare-selection-btn');
  const highlights = document.getElementsByClassName('highlight-tr');
  if (highlights.length === 2) {
    compareSelectionBtn.style.removeProperty('display');
  } else {
    compareSelectionBtn.style.display = 'none';
  }

  if (saci) groupNavCheckbox.removeAttribute('disabled');
  else groupNavCheckbox.setAttribute('disabled', 'true');
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

function configBtnHandler(): void {
  const dialog = document.getElementById("favDialog") as HTMLDialogElement;
  if (!dialog) return;
  if (dialog.open) {
    return;
  }
  const dialogContent = dialog.querySelector('#dialog-content');
  const configDialogContent = makeConfigDialogContent();
  dialogContent.replaceChildren(...[configDialogContent]);

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
    saciOriginal = [...data];
    groupNavCheckbox.removeAttribute('disabled');
    groupNavCheckbox.checked = false;
    if (saciDataCount) saciDataCount.innerText = `${saci.length} itens`
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
    if (saasDataCount) saasDataCount.innerText = `${saas.length} itens`
    setDivergenceCount(null);
  };
  input.click();
}

function downloadSAASCodeBtnHandler(e: MouseEvent): void {
  e.preventDefault();
  copyToClipboard(SAAS_CODE);
  showToast('Códido copiado!');
}

function downloadTPMCodeBtnHandler(e: MouseEvent): void {
  e.preventDefault();
  copyToClipboard(TAMPERMONKEY_CODE);
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

function hasDataCheck(which: 'full' | 'saci' | 'saas' = 'full', silent = false) {
  if (which === 'full' && !saas && !saci) {
    if (!silent) alert(`Faça o upload dos dados.`);
    return false;
  }
  if ((which === 'full' || which === 'saas') && !saas) {
    if (!silent) alert(`Faça o upload dos dados do SAAS.`);
    return false;
  }
  if ((which === 'full' || which === 'saci') && !saci) {
    if (!silent) alert(`Faça o upload dos dados do SACI.`);
    return false;
  }
  return true;
}

async function exportStudentsBtnHandler() {
  if (!hasDataCheck()) return;
  const notRegistered = await getNotRegisteredStudents(saciOriginal, saas)
  download(notRegistered, 'alunos_n_registrados.xlsx');
}

function groupNavHandler(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.checked) {
    saci = groupNavSaci(saci);
  } else {
    saci = [...saciOriginal];
  }
  if (saciDataCount) saciDataCount.innerText = `${saci.length} itens`
  makeTable(saci, 'saci-tbl');
  compareBtnHandler(true);
}

function setDivergenceCount(n: number | null) {
  if (n === null) {
    saciDataCountDiverg.innerText = '';
    saciDataCountDiverg.style.removeProperty('color');
  }
  else {
    saciDataCountDiverg.innerText = ` (${n} divergências)`;
    saciDataCountDiverg.style.color = n > 0 ? 'red' : '#44c344';
  }
}

function compareBtnHandler(silentDataCheck = false) {
  if (!hasDataCheck('full', silentDataCheck)) return;

  Array.from(document.querySelectorAll('.divergent-tr'))
  .forEach((el) => el.classList.remove('divergent-tr'));

  const divergentIds = compareData(saci, saas);
  if (!divergentIds.length) {
    Array.from(document.querySelectorAll('#saas-tbl tr'))
      .forEach((tr) => tr.classList.remove('divergent-tr'))
    setDivergenceCount(0);
    return
  }
  
  setDivergenceCount(divergentIds.length);
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