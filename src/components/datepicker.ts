import { escapeHtml, getTodayISODate } from '../utils/text';

type DateMode = 'single' | 'multiple' | 'range';

export function renderDatepicker(
  containerId: string,
  value: string[],
  onChange: (val: string[]) => void
): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const mode = determineMode(value);
  const today = getTodayISODate();

  container.innerHTML = buildHTML(containerId, mode, value, today);
  attachListeners(container, onChange);
}

function determineMode(value: string[]): DateMode {
  if (value.length <= 1) return 'single';
  if (value.length === 2) return 'range';
  return 'multiple';
}

function getContainerId(container: HTMLElement): string {
  return container.id || 'fechaEvento-container';
}

function buildHTML(containerId: string, mode: DateMode, value: string[], today: string): string {
  const modeLabels: Record<DateMode, string> = { single: 'Una fecha', multiple: 'Varias fechas', range: 'Rango' };

  return `
    <input type="hidden" id="${containerId}-value" value="${escapeHtml(value.join(','))}">
    <div class="dp-mode-toggle">
      ${(['single', 'multiple', 'range'] as DateMode[]).map(m =>
        `<button type="button" class="dp-mode-btn${m === mode ? ' dp-active' : ''}" data-mode="${m}">${modeLabels[m]}</button>`
      ).join('')}
    </div>
    <div class="dp-body" data-mode="${mode}">
      ${renderBody(mode, value, today)}
    </div>`;
}

function renderBody(mode: DateMode, value: string[], today: string): string {
  switch (mode) {
    case 'single':
      return `<input type="date" class="std-input dp-date-input" value="${escapeHtml(value[0] || today)}" max="${today}">`;
    case 'range':
      return `
        <div class="dp-range">
          <div class="dp-range-field">
            <label class="dp-label">Desde</label>
            <input type="date" class="std-input dp-date-input" value="${escapeHtml(value[0] || '')}" max="${today}">
          </div>
          <span class="dp-range-sep">—</span>
          <div class="dp-range-field">
            <label class="dp-label">Hasta</label>
            <input type="date" class="std-input dp-date-input" value="${escapeHtml(value[1] || '')}" max="${today}">
          </div>
        </div>`;
    case 'multiple':
      return `
        <div class="dp-multi">
          <div class="dp-multi-add">
            <input type="date" class="std-input dp-date-input dp-multi-input" max="${today}">
            <button type="button" class="btn btn-primary btn-sm dp-add-btn">Agregar</button>
          </div>
          <div class="dp-chips">
            ${value.map((d, i) =>
              `<span class="dp-chip">${escapeHtml(formatShortDate(d))}<button type="button" class="dp-chip-remove" data-index="${i}">&times;</button></span>`
            ).join('')}
          </div>
        </div>`;
  }
}

function attachListeners(container: HTMLElement, onChange: (val: string[]) => void): void {
  const cid = getContainerId(container);

  const getValue = (): string[] => {
    const hidden = document.getElementById(`${cid}-value`) as HTMLInputElement | null;
    return hidden?.value ? hidden.value.split(',').filter(Boolean) : [];
  };

  const setValue = (val: string[]) => {
    const hidden = document.getElementById(`${cid}-value`) as HTMLInputElement | null;
    if (hidden) hidden.value = val.join(',');
    onChange(val);
  };

  const updateBody = (mode: DateMode, val: string[]) => {
    const body = container.querySelector('.dp-body') as HTMLElement | null;
    if (body) {
      body.dataset.mode = mode;
      body.innerHTML = renderBody(mode, val, getTodayISODate());
      attachBodyListeners(container, onChange);
    }
  };

  attachBodyListeners(container, onChange);

  container.querySelectorAll('.dp-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newMode = (btn as HTMLElement).dataset.mode as DateMode;
      container.querySelectorAll('.dp-mode-btn').forEach(b => b.classList.remove('dp-active'));
      btn.classList.add('dp-active');
      const currentVal = getValue();
      if (newMode === 'single' && currentVal.length > 1) {
        setValue([currentVal[0]]);
        updateBody(newMode, [currentVal[0]]);
      } else {
        updateBody(newMode, currentVal);
      }
    });
  });
}

function attachBodyListeners(container: HTMLElement, onChange: (val: string[]) => void): void {
  const cid = getContainerId(container);

  const getValue = (): string[] => {
    const hidden = document.getElementById(`${cid}-value`) as HTMLInputElement | null;
    return hidden?.value ? hidden.value.split(',').filter(Boolean) : [];
  };

  const setValue = (val: string[]) => {
    const hidden = document.getElementById(`${cid}-value`) as HTMLInputElement | null;
    if (hidden) hidden.value = val.join(',');
    onChange(val);
  };

  container.querySelectorAll('.dp-date-input').forEach(input => {
    input.removeEventListener('change', handleDateChange);
    input.addEventListener('change', handleDateChange);
  });

  container.querySelectorAll('.dp-add-btn').forEach(btn => {
    btn.removeEventListener('click', handleAddClick);
    btn.addEventListener('click', handleAddClick);
  });

  container.querySelectorAll('.dp-chip-remove').forEach(btn => {
    btn.removeEventListener('click', handleRemoveClick);
    btn.addEventListener('click', handleRemoveClick);
  });

  function handleDateChange(this: HTMLElement) {
    const body = container.querySelector('.dp-body') as HTMLElement | null;
    const mode = body?.dataset.mode as DateMode | undefined;
    const val = getValue();
    if (mode === 'single') {
      const input = this as HTMLInputElement;
      setValue(input.value ? [input.value] : []);
    } else if (mode === 'range') {
      const inputs = container.querySelectorAll('.dp-range .dp-date-input');
      const from = (inputs[0] as HTMLInputElement)?.value || '';
      const to = (inputs[1] as HTMLInputElement)?.value || '';
      const newVal: string[] = [];
      if (from) newVal.push(from);
      if (to) newVal.push(to);
      setValue(newVal);
    }
  }

  function handleAddClick() {
    const input = container.querySelector('.dp-multi-input') as HTMLInputElement | null;
    if (!input || !input.value) return;
    const val = getValue();
    if (val.includes(input.value)) return;
    const newVal = [...val, input.value];
    setValue(newVal);
    input.value = '';
    const body = container.querySelector('.dp-body') as HTMLElement | null;
    const mode = body?.dataset.mode as DateMode;
    if (body) body.innerHTML = renderBody(mode, newVal, getTodayISODate());
    attachBodyListeners(container, onChange);
  }

  function handleRemoveClick(this: HTMLElement) {
    const index = parseInt((this as HTMLElement).dataset.index || '-1', 10);
    if (index < 0) return;
    const val = getValue();
    const newVal = val.filter((_, i) => i !== index);
    setValue(newVal);
    const body = container.querySelector('.dp-body') as HTMLElement | null;
    const mode = body?.dataset.mode as DateMode;
    if (body) body.innerHTML = renderBody(mode, newVal, getTodayISODate());
    attachBodyListeners(container, onChange);
  }
}

export function getDatepickerValue(containerId: string): string[] {
  const hidden = document.getElementById(`${containerId}-value`) as HTMLInputElement | null;
  return hidden?.value ? hidden.value.split(',').filter(Boolean) : [];
}

export function setDatepickerValue(containerId: string, value: string[]): void {
  const hidden = document.getElementById(`${containerId}-value`) as HTMLInputElement | null;
  if (hidden) hidden.value = value.join(',');
  const body = document.querySelector(`#${CSS.escape(containerId)} .dp-body`) as HTMLElement | null;
  if (body) {
    const mode = determineMode(value);
    body.dataset.mode = mode;
    body.innerHTML = renderBody(mode, value, getTodayISODate());
    const container = document.getElementById(containerId);
    if (container) {
      container.querySelectorAll('.dp-mode-btn').forEach(b => {
        b.classList.toggle('dp-active', b.getAttribute('data-mode') === mode);
      });
      attachBodyListeners(container, () => {});
    }
  }
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}
