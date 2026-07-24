import { put, get, del, head } from '@vercel/blob';

const BLOB_FILENAME = 'analysis.json';

export async function readAnalysis() {
  try {
    const blob = await get(BLOB_FILENAME, { access: 'private' });
    if (!blob) return null;
    const text = await blob.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function writeAnalysis(data: any) {
  try {
    const record = {
      id: 'analisis',
      savedAt: new Date().toISOString(),
      data: data.data || data,
    };
    await put(BLOB_FILENAME, JSON.stringify(record), {
      contentType: 'application/json',
      access: 'private',
      addRandomSuffix: false,
    });
  } catch {
    // blob unavailable
  }
}

export async function checkAnalysis() {
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

export async function deleteAnalysisFile() {
  try {
    await del(BLOB_FILENAME);
    return true;
  } catch {
    return false;
  }
}
