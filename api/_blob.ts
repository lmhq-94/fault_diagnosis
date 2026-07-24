import { put, get, del, head } from '@vercel/blob';

const BLOB_FILENAME = 'analysis.json';

export interface AnalysisRecord {
  id: string;
  savedAt: string;
  data: any;
}

export async function readAnalysis(): Promise<AnalysisRecord | null> {
  try {
    const blob = await get(BLOB_FILENAME);
    if (!blob) return null;
    const text = await blob.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function writeAnalysis(data: any): Promise<void> {
  const record: AnalysisRecord = {
    id: 'analisis',
    savedAt: new Date().toISOString(),
    data: data.data || data,
  };
  try {
    await put(BLOB_FILENAME, JSON.stringify(record), {
      contentType: 'application/json',
      access: 'private',
      addRandomSuffix: false,
    });
  } catch {
    // blob unavailable
  }
}

export async function checkAnalysis(): Promise<{
  exists: boolean;
  savedAt?: string;
  captura?: any;
  whys?: any;
  ishikawa?: any;
  acciones?: any;
}> {
  try {
    const blobHead = await head(BLOB_FILENAME);
    if (!blobHead) return { exists: false };
    const record = await readAnalysis();
    if (!record) return { exists: false };
    return {
      exists: true,
      savedAt: record.savedAt,
      captura: record.data?.captura || {},
      whys: record.data?.whys || {},
      ishikawa: record.data?.ishikawa || {},
      acciones: record.data?.acciones || { correctivas: [], preventivas: [] },
    };
  } catch {
    return { exists: false };
  }
}

export async function deleteAnalysisFile(): Promise<boolean> {
  try {
    await del(BLOB_FILENAME);
    return true;
  } catch {
    return false;
  }
}
