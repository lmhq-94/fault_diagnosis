import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatSingleDate,
  formatShortDate,
  formatDateRange,
  serializeDates,
  parseDates,
  getWhy,
  setWhy,
  getLastWhyLevel,
  getCurrentCauseSummary,
  isWizardCompleted,
  getWizardLevel,
} from './store';

describe('formatSingleDate', () => {
  it('formats ISO date to Spanish locale', () => {
    const result = formatSingleDate('2026-07-23');
    expect(result).toContain('julio');
    expect(result).toContain('2026');
    expect(result).toContain('23');
  });

  it('returns empty string for empty input', () => {
    expect(formatSingleDate('')).toBe('');
  });

  it('returns input unchanged if not a valid ISO date', () => {
    const result = formatSingleDate('not-a-date');
    expect(result).toBe('not-a-date');
  });
});

describe('formatShortDate', () => {
  it('converts ISO to DD/MM format', () => {
    expect(formatShortDate('2026-07-23')).toBe('23/07');
    expect(formatShortDate('2026-03-15')).toBe('15/03');
  });

  it('returns empty for empty input', () => {
    expect(formatShortDate('')).toBe('');
  });

  it('returns input unchanged if malformed', () => {
    expect(formatShortDate('abc')).toBe('abc');
  });
});

describe('formatDateRange', () => {
  it('formats range in same month', () => {
    const result = formatDateRange('2026-07-10', '2026-07-15');
    expect(result).toContain('10');
    expect(result).toContain('15');
    expect(result).toContain('julio');
    expect(result).toContain('—');
  });

  it('formats range across months', () => {
    const result = formatDateRange('2026-07-10', '2026-08-15');
    expect(result).toContain('julio');
    expect(result).toContain('agosto');
    expect(result).toContain('—');
  });

  it('returns single date if only one provided', () => {
    const d = formatDateRange('2026-07-23', '');
    expect(d).toContain('julio');
    const d2 = formatDateRange('', '2026-07-23');
    expect(d2).toContain('julio');
  });
});

describe('formatDate', () => {
  it('formats single date string', () => {
    const result = formatDate('2026-07-23') as string;
    expect(result).toContain('julio');
  });

  it('formats single date array', () => {
    const result = formatDate(['2026-07-23']) as string;
    expect(result).toContain('julio');
  });

  it('formats range array (2 elements)', () => {
    const result = formatDate(['2026-07-10', '2026-07-15']) as string;
    expect(result).toContain('—');
  });

  it('formats multiple dates array (3+ elements)', () => {
    const result = formatDate(['2026-07-10', '2026-07-14', '2026-07-20']) as string;
    expect(result).toBe('10/07, 14/07, 20/07');
  });

  it('returns empty for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty for empty array', () => {
    expect(formatDate([])).toBe('');
  });
});

describe('serializeDates', () => {
  it('joins dates with comma and space', () => {
    expect(serializeDates(['2026-07-10', '2026-07-15'])).toBe('2026-07-10, 2026-07-15');
  });

  it('filters out empty strings', () => {
    expect(serializeDates(['2026-07-10', '', '2026-07-15'])).toBe('2026-07-10, 2026-07-15');
  });

  it('returns empty string for undefined', () => {
    expect(serializeDates(undefined)).toBe('');
  });

  it('returns empty string for empty array', () => {
    expect(serializeDates([])).toBe('');
  });
});

describe('parseDates', () => {
  it('splits comma-separated dates', () => {
    expect(parseDates('2026-07-10, 2026-07-15')).toEqual(['2026-07-10', '2026-07-15']);
  });

  it('trims whitespace', () => {
    expect(parseDates('  2026-07-10 , 2026-07-15 ')).toEqual(['2026-07-10', '2026-07-15']);
  });

  it('filters empty entries', () => {
    expect(parseDates('2026-07-10, , 2026-07-15')).toEqual(['2026-07-10', '2026-07-15']);
  });

  it('returns empty array for empty string', () => {
    expect(parseDates('')).toEqual([]);
  });
});

describe('getWhy / setWhy', () => {
  const whys = { why1: '', why2: '', why3: '', why4: '', why5: '', wizardLevel: 1 };

  it('sets and gets values by level', () => {
    setWhy(whys, 1, 'causa 1');
    expect(getWhy(whys, 1)).toBe('causa 1');
    setWhy(whys, 3, 'causa 3');
    expect(getWhy(whys, 3)).toBe('causa 3');
  });

  it('returns empty string for unset values', () => {
    expect(getWhy(whys, 5)).toBe('');
  });
});

describe('wizard state helpers', () => {
  it('getWizardLevel defaults correctly', () => {
    expect(getWizardLevel()).toBeGreaterThanOrEqual(1);
  });

  it('isWizardCompleted returns false initially', () => {
    expect(isWizardCompleted()).toBe(false);
  });

  it('getCurrentCauseSummary returns empty string when no whys set', () => {
    const result = getCurrentCauseSummary();
    expect(typeof result).toBe('string');
  });

  it('getLastWhyLevel returns 0 when no whys', () => {
    expect(getLastWhyLevel()).toBe(0);
  });
});
