import { readAnalysis } from './_blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ blobUnavailable: true });
  }
  try {
    const record = await readAnalysis();
    if (!record) return res.status(404).json({ error: 'Analysis not found' });
    res.status(200).json(record);
  } catch {
    res.status(200).json({ blobUnavailable: true });
  }
}
