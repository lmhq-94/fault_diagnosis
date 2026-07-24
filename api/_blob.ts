const BLOB_FILENAME = 'analysis.json';

function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

let _blobModule: any = null;
async function getBlob() {
  if (!_blobModule) {
    try {
      _blobModule = await import('@vercel/blob');
    } catch {
      _blobModule = { error: true };
    }
  }
  return _blobModule;
}

export interface AnalysisRecord {
  id: string;
  savedAt: string;
  data: any;
}

export async function readAnalysis(): Promise<AnalysisRecord | null> {
  if (!isBlobConfigured()) return null;
  try {
    const blob = await getBlob();
    if (blob.error) return null;
    const result = await blob.get(BLOB_FILENAME);
    if (!result) return null;
    const text = await result.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function writeAnalysis(data: any): Promise<void> {
  if (!isBlobConfigured()) return;
  const record: AnalysisRecord = {
    id: 'analisis',
    savedAt: new Date().toISOString(),
    data: data.data || data,
  };
  try {
    const blob = await getBlob();
    if (blob.error) return;
    await blob.put(BLOB_FILENAME, JSON.stringify(record), {
      contentType: 'application/json',
      access: 'private',
      addRandomSuffix: false,
    });
  } catch {
    // blob unavailable — caller should handle
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
  if (!isBlobConfigured()) return { exists: false };
  try {
    const blob = await getBlob();
    if (blob.error) return { exists: false };
    const headResult = await blob.head(BLOB_FILENAME);
    if (!headResult) return { exists: false };
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
  if (!isBlobConfigured()) return false;
  try {
    const blob = await getBlob();
    if (blob.error) return false;
    await blob.del(BLOB_FILENAME);
    return true;
  } catch {
    return false;
  }
}
