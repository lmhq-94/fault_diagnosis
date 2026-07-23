import { getLogs, clearLogs, type LogEntry } from '../utils/logger';

const VIEWER_ID = 'log-viewer';

function viewerHTML(): string {
  const logs = getLogs();
  const rows = logs.length === 0
    ? '<div class="log-empty">No hay logs registrados.</div>'
    : logs.map(log => {
      const levelClass = `log-level-${log.level}`;
      const time = new Date(log.timestamp).toLocaleTimeString();
      return `<div class="log-row ${levelClass}">
        <span class="log-time">${time}</span>
        <span class="log-level">${log.level.toUpperCase()}</span>
        <span class="log-context">[${log.context}]</span>
        <span class="log-msg">${log.message}</span>
      </div>`;
    }).join('');
  return `<div id="${VIEWER_ID}" class="log-viewer hidden">
    <div class="log-header">
      <h3>Registro de eventos</h3>
      <div class="log-header-actions">
        <button class="log-btn" id="log-clear" title="Limpiar"><i class="fas fa-eraser"></i></button>
        <button class="log-btn" id="log-close" title="Cerrar"><i class="fas fa-times"></i></button>
      </div>
    </div>
    <div class="log-body">${rows}</div>
  </div>`;
}

function toggle(): void {
  const existing = document.getElementById(VIEWER_ID);
  if (existing) {
    existing.remove();
    return;
  }
  const wrapper = document.createElement('div');
  wrapper.innerHTML = viewerHTML();
  document.body.appendChild(wrapper.firstElementChild!);
  document.getElementById('log-close')?.addEventListener('click', () => {
    document.getElementById(VIEWER_ID)?.remove();
  });
  document.getElementById('log-clear')?.addEventListener('click', () => {
    clearLogs();
    document.getElementById(VIEWER_ID)?.remove();
  });
}

export function initLogViewer(): void {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      toggle();
    }
  });
}
