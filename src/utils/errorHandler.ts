import { showToast } from './toast';
import { logError, logWarn } from './logger';

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}

export function handleError(error: unknown, context: string): void {
  const message = extractErrorMessage(error);
  logError(context, message, error);
  showToast(`Error al ${context}: ${message}`, 'error');
}

export function handleSilentError(error: unknown, context: string): void {
  const message = extractErrorMessage(error);
  logWarn(context, message, error);
}
