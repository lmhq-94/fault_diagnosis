import { rcaData, CATEGORY_ORDER, persistCurrentState, hasData, getCurrentCauseSummary } from '../state/store';
import { refreshIshikawaDiagram, clearIshikawa } from './ishikawa';
import { clearWhys } from './whys-wizard';
import { clearActionPlan } from './plan';
import { setDatepickerValue, getDatepickerValue } from './datepicker';
import { getTodayISODate } from '../utils/text';
import { confirmAction } from '../utils/confirm';
import { showToast } from '../utils/toast';

export const STEPS = ['captura', 'ishikawa', '5whys', 'plan'] as const;
type StepName = (typeof STEPS)[number];

/* ==========================================================================
   Tab Navigation
   ========================================================================== */

export function showTab(tabName: string): void {
  if (tabName !== 'captura') {
    const tabBtn = document.getElementById(`tab-${tabName}`);
    if (tabBtn && tabBtn.classList.contains('tab-locked')) return;
  }

  document.querySelectorAll('[id^="content-"]').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('[id^="tab-"]').forEach(el => el.classList.remove('tab-active'));

  document.getElementById(`content-${tabName}`)?.classList.remove('hidden');
  document.getElementById(`tab-${tabName}`)?.classList.add('tab-active');

  if (tabName === 'ishikawa') {
    refreshIshikawaDiagram();
    updateIshikawaGenerateBtn();
  }
  if (tabName === 'plan') {
    syncPlanFromAnalysis();
  }
  if (tabName === '5whys') {
    updateTabLockState();
  }

  localStorage.setItem('rcaCurrentStep', tabName);
  updateStepNav();
}

/* ==========================================================================
   Step Navigation
   ========================================================================== */

export function navigateStep(dir: number): void {
  const currentTab = document.querySelector('[id^="content-"]:not(.hidden)');
  if (!currentTab) return;
  const currentId = currentTab.id.replace('content-', '');
  const currentIndex = STEPS.indexOf(currentId as StepName);
  if (currentIndex === -1) return;

  const nextIndex = currentIndex + dir;
  if (nextIndex < 0 || nextIndex >= STEPS.length) return;

  const nextTab = STEPS[nextIndex];

  if (currentId === 'captura') {
    saveCaptura();
    if (!rcaData.captura.problema) {
      showToast('Describe el problema antes de continuar.', 'warning');
      return;
    }
  } else if (currentId === 'ishikawa') {
    saveIshikawaData();
  } else if (currentId === '5whys') {
    const input = document.getElementById('why-active-input') as HTMLInputElement | null;
    if (input) {
      const level = rcaData.whys.wizardLevel;
      if (level >= 1 && level <= 5) {
        if (level === 1) rcaData.whys.why1 = input.value.trim();
        else if (level === 2) rcaData.whys.why2 = input.value.trim();
        else if (level === 3) rcaData.whys.why3 = input.value.trim();
        else if (level === 4) rcaData.whys.why4 = input.value.trim();
        else if (level === 5) rcaData.whys.why5 = input.value.trim();
      }
    }
    persistCurrentState();
  }

  showTab(nextTab);

  if (currentId === '5whys') {
    updateTabLockState();
  }
}

/* ==========================================================================
   Ishikawa Save
   ========================================================================== */

export function saveIshikawaData(): void {
  CATEGORY_ORDER.forEach(cat => {
    const field = document.getElementById(`ishikawa-${cat}`) as HTMLTextAreaElement | null;
    if (field && field.value.trim()) {
      rcaData.ishikawa[cat] = field.value.trim();
    }
  });
  refreshIshikawaDiagram();
  syncPlanFromAnalysis();
  persistCurrentState();
  updateTabLockState();
}

/* ==========================================================================
   Step Nav UI
   ========================================================================== */

export function updateStepNav(): void {
  const currentTab = document.querySelector('[id^="content-"]:not(.hidden)');
  if (!currentTab) return;
  const currentId = currentTab.id.replace('content-', '');
  const currentIndex = STEPS.indexOf(currentId as StepName);
  if (currentIndex === -1) return;

  const dots = document.querySelectorAll('.step-nav-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
    dot.classList.toggle('completed', i < currentIndex);
  });

  const prevBtn = document.getElementById('step-nav-prev') as HTMLButtonElement | null;
  if (prevBtn) {
    prevBtn.style.display = currentIndex === 0 ? 'none' : '';
    prevBtn.disabled = false;
  }

  const accionesLabel = document.querySelector('#step-nav-more button span');
  if (accionesLabel) {
    (accionesLabel as HTMLElement).style.display = currentIndex === 0 ? '' : 'none';
  }

  const navRight = document.getElementById('step-nav-right');
  if (!navRight) return;

  if (currentId === 'plan') {
    navRight.innerHTML = `
      <button id="step-nav-save" class="step-nav-btn step-nav-btn-success" onclick="window.__saveAnalysis()">
        <i class="fas fa-save"></i>
        <span>Guardar</span>
      </button>
    `;
    return;
  }

  const isLast = currentIndex === STEPS.length - 2;
  const isWhys = currentId === '5whys';
  const nextLabel = isWhys ? 'Siguiente' : (isLast ? 'Finalizar' : 'Siguiente');
  const nextIcon = isWhys ? 'fa-arrow-right' : (isLast ? 'fa-check-circle' : 'fa-arrow-right');
  const nextClass = isWhys ? 'step-nav-btn-primary' : (isLast ? 'step-nav-btn-success' : 'step-nav-btn-primary');

  navRight.innerHTML = `
    <button id="step-nav-next" class="step-nav-btn ${nextClass}" onclick="window.__navigateStep(1)" disabled>
      <span>${nextLabel}</span>
      <i class="fas ${nextIcon}"></i>
    </button>
  `;

  updateNextButtonState(currentId);
}

export function updateNextButtonState(tabId: string): void {
  const nextBtn = document.getElementById('step-nav-next') as HTMLButtonElement | null;
  if (!nextBtn) return;

  if (tabId === 'captura') {
    const problema = (document.getElementById('descripcionProblema') as HTMLTextAreaElement)?.value?.trim() || '';
    nextBtn.disabled = !problema;
  } else {
    nextBtn.disabled = false;
  }
}

/* ==========================================================================
   Stepper State Management
   ========================================================================== */

export function updateTabLockState(): void {
  const c = rcaData.captura || {};
  const w = rcaData.whys || {};
  const ish = rcaData.ishikawa || {};
  const acciones = rcaData.acciones || { correctivas: [], preventivas: [] };

  const allCapturaFields = [c.fecha?.length ? c.fecha.join(', ') : '', c.maquina, c.tiempoParo, c.problema, c.sintomas, c.responsable];
  const capturaCompleta = allCapturaFields.every(val => !!val);
  const ishikawaCompleto = CATEGORY_ORDER.every(cat => !!ish[cat]);
  const onWhysTab = !document.getElementById('content-5whys')?.classList.contains('hidden');
  const whysCompleto = !onWhysTab && !!(w.why1 || w.why2 || w.why3 || w.why4 || w.why5);
  const planCompleto = !!(acciones.correctivas.length > 0 || acciones.preventivas.length > 0);
  const capturaDesbloqueada = !!c.problema;

  const lockedTabs = ['ishikawa', '5whys', 'plan'];
  lockedTabs.forEach(tabName => {
    const btn = document.getElementById(`tab-${tabName}`);
    if (!btn) return;
    if (capturaDesbloqueada) {
      btn.classList.remove('tab-locked');
      btn.onclick = null;
      btn.onclick = function() { showTab(tabName); };
    } else {
      btn.classList.add('tab-locked');
    }
  });

  document.querySelectorAll('.step-header-actions').forEach(el => {
    el.classList.toggle('hidden', !capturaDesbloqueada);
  });

  const toggleComplete = (id: string, condition: boolean) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('completed', condition);
  };

  toggleComplete('tab-captura', capturaCompleta);
  toggleComplete('conn-0', capturaCompleta);
  toggleComplete('tab-ishikawa', ishikawaCompleto && capturaDesbloqueada);
  toggleComplete('conn-1', ishikawaCompleto && capturaDesbloqueada);
  toggleComplete('tab-5whys', whysCompleto && capturaDesbloqueada);
  toggleComplete('conn-2', whysCompleto && capturaDesbloqueada);
  toggleComplete('tab-plan', planCompleto && capturaDesbloqueada);
}

/* ==========================================================================
   Sync / Resumen
   ========================================================================== */

export function syncPlanFromAnalysis(): void {
  updateResumen();
}

export function updateResumen(): void {
  const resumenProblema = document.getElementById('resumenProblema');
  const resumenCausa = document.getElementById('resumenCausa');
  const resumenIndicadores = document.getElementById('resumenIndicadores');
  if (resumenProblema) resumenProblema.textContent = rcaData.captura.problema || 'No definido';
  const causaRaiz = getCurrentCauseSummary();
  if (resumenCausa) resumenCausa.textContent = causaRaiz || 'No definida';
  if (resumenIndicadores) {
    const indicadores = rcaData.captura.indicador ? rcaData.captura.indicador.split(',').join(', ') : 'Ninguno';
    resumenIndicadores.textContent = indicadores;
  }
}

/* ==========================================================================
   Clear All Button Visibility
   ========================================================================== */

export function updateClearAllButton(): void {
  const hasDataVal = hasData();
  ['clearAllBtnDrawer', 'clearAllBtnTable'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle('hidden', !hasDataVal);
  });
}

/* ==========================================================================
   Step Menu & Clear Current Step
   ========================================================================== */

export function toggleStepMenu(e: Event): void {
  e.stopPropagation();
  const menu = document.getElementById('step-nav-menu');
  if (menu) menu.classList.toggle('open');
}

export async function clearCurrentStep(): Promise<void> {
  const menu = document.getElementById('step-nav-menu');
  if (menu) menu.classList.remove('open');

  const currentTab = document.querySelector('[id^="content-"]:not(.hidden)');
  if (!currentTab) return;
  const currentId = currentTab.id.replace('content-', '');

  const labelMap: Record<string, string> = {
    captura: 'Captura del Problema',
    ishikawa: 'Diagrama de Ishikawa',
    '5whys': '5 Porqués',
    plan: 'Plan de Acción'
  };
  const confirmed = await confirmAction(`¿Limpiar todos los datos de ${labelMap[currentId] || currentId}?`);
  if (!confirmed) return;

  switch (currentId) {
    case 'captura': clearCaptura(); break;
    case 'ishikawa': clearIshikawa(syncPlanFromAnalysis, persistCurrentState); updateIshikawaGenerateBtn(); break;
    case '5whys': clearWhys(resetWhysState, syncPlanFromAnalysis, persistCurrentState); break;
    case 'plan': clearActionPlan(); persistCurrentState(); break;
  }

  updateTabLockState();
  updateClearAllButton();
  updateStepNav();
}

/* ==========================================================================
   Captura Helpers
   ========================================================================== */

export function clearCaptura(): void {
  rcaData.captura = {};
  setDatepickerValue('fechaEvento-container', [getTodayISODate()]);
  const ids = ['maquina', 'tiempoParo', 'descripcionProblema', 'sintomas', 'responsable', 'indicador'];
  ids.forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (el) el.value = '';
  });
  document.querySelectorAll<HTMLInputElement>('input[name="indicador"]').forEach(cb => cb.checked = false);
  syncPlanFromAnalysis();
  persistCurrentState();
}

export function resetWhysState(): void {
  rcaData.whys = { why1: '', why2: '', why3: '', why4: '', why5: '', wizardLevel: 1 };
}

export function updateIshikawaGenerateBtn(): void {
  const ISHIKAWA_FIELDS = ['maquina', 'metodo', 'materiales', 'manoObra', 'medicion', 'medioAmbiente'];
  const allFilled = ISHIKAWA_FIELDS.every(cat => {
    const field = document.getElementById(`ishikawa-${cat}`) as HTMLTextAreaElement | null;
    return (field?.value?.trim()?.length ?? 0) > 0;
  });
  const btn = document.getElementById('btn-generar-ishikawa') as HTMLButtonElement | null;
  const area = document.getElementById('ishikawa-generate-area');
  if (btn) btn.disabled = !allFilled;
  if (area) area.classList.toggle('ready', allFilled);
}

export function saveCaptura(): void {
  syncIndicador();
  rcaData.captura = {
    fecha: getDatepickerValue('fechaEvento-container'),
    maquina: (document.getElementById('maquina') as HTMLSelectElement)?.value || '',
    tiempoParo: (document.getElementById('tiempoParo') as HTMLInputElement)?.value || '',
    problema: (document.getElementById('descripcionProblema') as HTMLTextAreaElement)?.value || '',
    sintomas: (document.getElementById('sintomas') as HTMLTextAreaElement)?.value || '',
    responsable: (document.getElementById('responsable') as HTMLInputElement)?.value || '',
    indicador: (document.getElementById('indicador') as HTMLInputElement)?.value || ''
  };

  if (!rcaData.captura.problema) {
    showToast('Describe el problema antes de continuar.', 'warning');
    return;
  }

  syncPlanFromAnalysis();
  persistCurrentState();
  updateTabLockState();
}

export function syncIndicador(): void {
  const checked = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="indicador"]:checked'))
    .map(cb => cb.value)
    .join(',');
  const hidden = document.getElementById('indicador') as HTMLInputElement | null;
  if (hidden) {
    hidden.value = checked;
    hidden.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
