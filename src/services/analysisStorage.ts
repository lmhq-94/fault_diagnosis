/* ==========================================================================
   Analysis Storage Service
   Communicates with the Vite API middleware to save/load/check/delete
   a single analysis file (analisis.json) in the project's analyses/ directory.
   Falls back to localStorage when the API is unavailable (e.g. on Vercel).
   ========================================================================== */

import type { RCAData } from '../state/store';

const LS_KEY = 'savedAnalysis';

/* ---------- localStorage fallback helpers ---------- */

function lsSave(data: RCAData): void {
  const record = {
    id: 'analisis',
    savedAt: new Date().toISOString(),
    data,
  };
  try { localStorage.setItem(LS_KEY, JSON.stringify(record)); } catch { /* ignore */ }
}

function lsLoad(): { savedAt: string; data: RCAData } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function lsDelete(): void {
  try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
}

/* ---------- Server API with localStorage fallback ---------- */

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Error en la comunicación con el servidor');
  }
  const data = await res.json();
  if (data && typeof data === 'object' && (data as any).blobUnavailable) {
    throw new Error('Almacenamiento en servidor no disponible');
  }
  return data;
}

async function apiOrFallback<T>(apiCall: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await apiCall();
  } catch {
    return fallback();
  }
}

async function apiOrFallbackVoid(apiCall: () => Promise<void>, fallback: () => void): Promise<void> {
  try {
    await apiCall();
  } catch {
    fallback();
  }
}

/** Saves the current analysis to analisis.json */
export async function saveAnalysisFile(data: RCAData): Promise<void> {
  await apiOrFallbackVoid(
    async () => {
      await apiFetch<{ success: boolean }>('/api/save-analysis', {
        method: 'POST',
        body: JSON.stringify({ data }),
      });
    },
    () => { lsSave(data); }
  );
}

interface CheckResult {
  exists: boolean;
  savedAt?: string;
  captura?: any;
  whys?: any;
  ishikawa?: any;
  acciones?: any;
}

/** Checks if analisis.json exists and returns its metadata */
export async function checkAnalysisFile(): Promise<CheckResult> {
  const fromLs = (): CheckResult => {
    const record = lsLoad();
    if (!record) return { exists: false };
    return {
      exists: true,
      savedAt: record.savedAt,
      captura: record.data?.captura || {},
      whys: record.data?.whys || {},
      ishikawa: record.data?.ishikawa || {},
      acciones: record.data?.acciones || { correctivas: [], preventivas: [] },
    };
  };

  try {
    const apiResult = await apiFetch<CheckResult>('/api/check-analysis');
    if (apiResult.exists) return apiResult;
    return fromLs();
  } catch {
    return fromLs();
  }
}

/** Loads the full data from analisis.json */
export async function loadAnalysis(): Promise<{ savedAt: string; data: RCAData }> {
  try {
    const apiResult = await apiFetch<{ savedAt: string; data: RCAData }>('/api/load-analysis');
    return apiResult;
  } catch {
    const record = lsLoad();
    if (!record) throw new Error('Analysis not found');
    return record;
  }
}

/** Overwrites analisis.json with new data */
export async function updateAnalysisFile(data: RCAData): Promise<void> {
  await apiOrFallbackVoid(
    async () => {
      await apiFetch<{ success: boolean }>('/api/update-analysis', {
        method: 'PUT',
        body: JSON.stringify({ data }),
      });
    },
    () => { lsSave(data); }
  );
}

/** Deletes analisis.json */
export async function deleteAnalysis(): Promise<void> {
  await apiOrFallbackVoid(
    async () => {
      await apiFetch<{ success: boolean }>('/api/delete-analysis', {
        method: 'DELETE',
      });
    },
    () => { lsDelete(); }
  );
}
