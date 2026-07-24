import { get } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BLOB_FILENAME = 'analysis.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ blobUnavailable: true });
  }

  try {
    const blob = await get(BLOB_FILENAME, { access: 'private' });
    if (!blob) {
      return res.status(200).json({ blobUnavailable: true, error: 'Analysis not found' });
    }
    const text = await blob.text();
    const record = JSON.parse(text);
    res.status(200).json(record);
  } catch {
    res.status(200).json({ blobUnavailable: true });
  }
}
