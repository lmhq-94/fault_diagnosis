import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  escapeHtml,
  uniqueValues,
  splitTextValues,
  sanitizeKeywordEntries,
  truncateText,
  getTodayISODate,
} from './text';

describe('normalizeText', () => {
  it('lowercases and removes accents', () => {
    expect(normalizeText('MÁQUINA')).toBe('maquina');
    expect(normalizeText('Método')).toBe('metodo');
    expect(normalizeText('Índice')).toBe('indice');
    expect(normalizeText('  Espacios  ')).toBe('espacios');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeText('')).toBe('');
  });

  it('handles undefined gracefully', () => {
    expect(normalizeText(undefined as any)).toBe('');
  });
});

describe('escapeHtml', () => {
  it('escapes special HTML characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(escapeHtml("it's a test")).toBe('it&#39;s a test');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('handles undefined gracefully', () => {
    expect(escapeHtml(undefined as any)).toBe('');
  });
});

describe('uniqueValues', () => {
  it('removes duplicates regardless of accents', () => {
    expect(uniqueValues(['causa', 'causa', 'CAUSA', 'causá'])).toEqual(['causa']);
  });

  it('filters out empty strings', () => {
    expect(uniqueValues(['a', '', '  ', 'b'])).toEqual(['a', 'b']);
  });

  it('returns empty array for empty input', () => {
    expect(uniqueValues([])).toEqual([]);
  });
});

describe('splitTextValues', () => {
  it('splits by newlines', () => {
    expect(splitTextValues('a\nb\nc')).toEqual(['a', 'b', 'c']);
  });

  it('splits by commas', () => {
    expect(splitTextValues('a, b, c')).toEqual(['a', 'b', 'c']);
  });

  it('splits by semicolons', () => {
    expect(splitTextValues('a; b; c')).toEqual(['a', 'b', 'c']);
  });

  it('removes duplicates', () => {
    expect(splitTextValues('a, b, a')).toEqual(['a', 'b']);
  });

  it('returns empty array for empty input', () => {
    expect(splitTextValues('')).toEqual([]);
  });
});

describe('sanitizeKeywordEntries', () => {
  it('filters entries with more than 4 words', () => {
    expect(sanitizeKeywordEntries(['one two three four', 'one two three four five']))
      .toEqual(['one two three four']);
  });

  it('filters entries longer than 40 characters', () => {
    expect(sanitizeKeywordEntries(['short', 'this is a very long entry that exceeds forty characters test']))
      .toEqual(['short']);
  });

  it('removes duplicates', () => {
    expect(sanitizeKeywordEntries(['a', 'a', 'b'])).toEqual(['a', 'b']);
  });
});

describe('truncateText', () => {
  it('returns text unchanged if within maxLength', () => {
    expect(truncateText('hello', 80)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncateText('hello world this is a long text', 20)).toBe('hello world this ...');
  });

  it('uses default maxLength of 80', () => {
    const short = 'a'.repeat(50);
    expect(truncateText(short)).toBe(short);
    const long = 'a'.repeat(100);
    expect(truncateText(long)).toBe('a'.repeat(77) + '...');
  });
});

describe('getTodayISODate', () => {
  it('returns today in YYYY-MM-DD format', () => {
    const result = getTodayISODate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const d = new Date();
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(result).toBe(expected);
  });
});
