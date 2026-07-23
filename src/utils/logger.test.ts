import { describe, it, expect, beforeEach } from 'vitest';
import { logInfo, logWarn, logError, getLogs, clearLogs } from './logger';

beforeEach(() => {
  clearLogs();
});

describe('logger', () => {
  it('logs info entries', () => {
    logInfo('test', 'info message');
    const logs = getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('info');
    expect(logs[0].context).toBe('test');
    expect(logs[0].message).toBe('info message');
  });

  it('logs warn entries', () => {
    logWarn('test', 'warning');
    expect(getLogs()).toHaveLength(1);
    expect(getLogs()[0].level).toBe('warn');
  });

  it('logs error entries', () => {
    logError('test', 'error msg');
    expect(getLogs()).toHaveLength(1);
    expect(getLogs()[0].level).toBe('error');
  });

  it('stores optional data', () => {
    logError('test', 'err', { code: 500 });
    expect(getLogs()[0].data).toEqual({ code: 500 });
  });

  it('assigns incrementing ids', () => {
    logInfo('a', '1');
    logInfo('b', '2');
    const logs = getLogs();
    expect(logs[0].id).toBe(1);
    expect(logs[1].id).toBe(2);
  });

  it('clearLogs removes all entries', () => {
    logInfo('a', '1');
    clearLogs();
    expect(getLogs()).toHaveLength(0);
  });

  it('limits to MAX_LOGS entries', () => {
    for (let i = 0; i < 250; i++) {
      logInfo('test', `msg ${i}`);
    }
    expect(getLogs().length).toBeLessThanOrEqual(210);
    expect(getLogs()[0].message).toBe('msg 50'); // first was evicted
  });
});
