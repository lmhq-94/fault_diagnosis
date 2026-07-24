import { checkAnalysis } from './_blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ exists: false, blobUnavailable: true });
  }
  try {
    const result = await checkAnalysis();
    res.status(200).json(result);
  } catch {
    res.status(200).json({ exists: false, blobUnavailable: true });
  }
}
