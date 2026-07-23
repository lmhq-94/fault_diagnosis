export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

const MAX_LOGS = 200;
const STORAGE_KEY = 'appLogs';

let logs: LogEntry[] = [];
let nextId = 1;

function load(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      logs = JSON.parse(stored);
      nextId = (logs.length > 0 ? Math.max(...logs.map(l => l.id)) : 0) + 1;
    }
  } catch {
    logs = [];
    nextId = 1;
  }
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-MAX_LOGS)));
  } catch {
    // storage full — silently skip
  }
}

load();

function add(level: LogLevel, context: string, message: string, data?: unknown): void {
  const entry: LogEntry = {
    id: nextId++,
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    data
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs = logs.slice(-MAX_LOGS);
  persist();
}

export function logInfo(context: string, message: string, data?: unknown): void {
  add('info', context, message, data);
}

export function logWarn(context: string, message: string, data?: unknown): void {
  add('warn', context, message, data);
}

export function logError(context: string, message: string, data?: unknown): void {
  add('error', context, message, data);
}

export function getLogs(): LogEntry[] {
  return [...logs];
}

export function clearLogs(): void {
  logs = [];
  nextId = 1;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
