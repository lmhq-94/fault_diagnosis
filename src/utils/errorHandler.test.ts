import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractErrorMessage } from './errorHandler';

describe('extractErrorMessage', () => {
  it('extracts message from Error instance', () => {
    expect(extractErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('returns string as-is', () => {
    expect(extractErrorMessage('raw string')).toBe('raw string');
  });

  it('extracts message from object with message property', () => {
    expect(extractErrorMessage({ message: 'object msg' })).toBe('object msg');
  });

  it('converts non-message objects to string', () => {
    expect(extractErrorMessage(42)).toBe('42');
    expect(extractErrorMessage(null)).toBe('null');
    expect(extractErrorMessage(undefined)).toBe('undefined');
  });
});
