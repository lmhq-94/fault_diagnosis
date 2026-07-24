import { head, get } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BLOB_FILENAME = 'analysis.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ exists: false, blobUnavailable: true });
  }

  try {
    const blobHead = await head(BLOB_FILENAME);
    if (!blobHead) return res.status(200).json({ exists: false });

    const blob = await get(BLOB_FILENAME, { access: 'private' });
    if (!blob) return res.status(200).json({ exists: false });

    const text = await blob.text();
    const record = JSON.parse(text);

    res.status(200).json({
      exists: true,
      savedAt: record.savedAt || '',
      captura: record.data?.captura || {},
      whys: record.data?.whys || {},
      ishikawa: record.data?.ishikawa || {},
      acciones: record.data?.acciones || { correctivas: [], preventivas: [] },
    });
  } catch {
    res.status(200).json({ exists: false, blobUnavailable: true });
  }
}
