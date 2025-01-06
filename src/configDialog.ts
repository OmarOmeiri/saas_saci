import { COLMAP_NAMES, CONFIG } from "./consts"

const isInputChecked = (c: keyof TCompare) => {
  return CONFIG.columnsToCompare[c] === true
}

const onInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const name = target.name;
  const dialog = document.getElementById('favDialog');
  dialog.setAttribute('data-reload', 'true');
  if (target.type === 'checkbox' && name in CONFIG.columnsToCompare) {
    CONFIG.columnsToCompare[name as keyof typeof CONFIG.columnsToCompare] = target.checked;
  }

  if (name === 'nmTolerance') {
    const numVal = Math.max(0, Number(target.value));
    CONFIG.nmTolerance = numVal
  }
}

export const makeConfigDialogContent = () => {
  const container = document.createElement('div')
  container.className = 'config-dialog-container';



  const checkboxes = Object.keys(CONFIG.columnsToCompare).flatMap((c) => {
    const col = c as keyof TCompare;
    const label = document.createElement('div');
    const input = document.createElement('input');
    const labelValue = document.createTextNode(`${COLMAP_NAMES[col as keyof SAASData]}:`);
    input.type = 'checkbox';
    input.id = `config-compare-${col}`
    input.name = col;
    input.checked = isInputChecked(col);
    input.addEventListener('change', onInputChange);
    label.appendChild(labelValue);
    return [label, input];
  });

  
  const nmTolInput = document.createElement('input');
  const inputDiv = document.createElement('div');

  const nmTolLabel = document.createElement('div');
  const labelValue = document.createTextNode('Tolerância NM:')

  nmTolInput.name = 'nmTolerance'
  nmTolInput.type = 'number'
  nmTolInput.min = '0';
  nmTolInput.addEventListener('change', onInputChange);
  nmTolInput.value = String(CONFIG.nmTolerance || 0)
  nmTolLabel.appendChild(labelValue);
  inputDiv.appendChild(nmTolInput);

  // container.append(...checkboxes, nmTolLabel);
  container.append(...checkboxes, nmTolLabel, nmTolInput);
  return container;
}