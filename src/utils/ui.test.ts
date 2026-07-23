import { describe, it, expect } from 'vitest';
import { createButton } from './ui';

describe('createButton', () => {
  it('creates a primary button by default', () => {
    const html = createButton({ label: 'Guardar' });
    expect(html).toContain('btn btn-primary');
    expect(html).toContain('<span>Guardar</span>');
  });

  it('adds icon when provided', () => {
    const html = createButton({ label: 'Exportar', icon: 'fa-download' });
    expect(html).toContain('<i class="fas fa-download"></i>');
  });

  it('applies sm size', () => {
    const html = createButton({ label: 'Editar', size: 'sm' });
    expect(html).toContain('btn-sm');
  });

  it('applies variant classes', () => {
    const html = createButton({ label: 'Cancelar', variant: 'secondary' });
    expect(html).toContain('btn-secondary');
  });

  it('adds extra attributes', () => {
    const html = createButton({ label: 'Test', attrs: { disabled: '', 'data-test': 'val' } });
    expect(html).toContain('disabled=""');
    expect(html).toContain('data-test="val"');
  });

  it('uses outline-success variant', () => {
    const html = createButton({ label: 'Resumen', variant: 'outline-success', size: 'sm' });
    expect(html).toContain('btn-outline-success');
    expect(html).toContain('btn-sm');
    expect(html).toContain('<span>Resumen</span>');
  });
});
