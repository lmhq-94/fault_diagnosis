export interface ButtonOptions {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-success' | 'success' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: string;
  label: string;
  attrs?: Record<string, string>;
}

export function createButton(opts: ButtonOptions): string {
  const classes = ['btn'];
  if (opts.variant && opts.variant !== 'primary') classes.push(`btn-${opts.variant}`);
  else classes.push('btn-primary');
  if (opts.size === 'sm') classes.push('btn-sm');
  const attrs = opts.attrs ? ' ' + Object.entries(opts.attrs).map(([k, v]) => `${k}="${v}"`).join(' ') : '';
  const icon = opts.icon ? `<i class="fas ${opts.icon}"></i>` : '';
  return `<button class="${classes.join(' ')}"${attrs}>${icon}<span>${opts.label}</span></button>`;
}

export interface ModalController {
  open: () => void;
  close: () => void;
}

export function initModal(overlayId: string, contentSelector: string, sourceSelector?: string): ModalController {
  function open(): void {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    if (sourceSelector && contentSelector) {
      const target = overlay.querySelector(contentSelector) as HTMLElement | null;
      const source = document.querySelector(sourceSelector) as HTMLElement | null;
      if (target && source) {
        target.innerHTML = source.innerHTML;
      }
    }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close(): void {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === overlay) close();
    });
    const closeBtn = overlay.querySelector('[data-modal-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    });
  }

  return { open, close };
}
