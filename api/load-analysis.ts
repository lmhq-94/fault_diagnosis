import { readAnalysis } from './_blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const record = await readAnalysis();
    if (!record) return res.status(404).json({ error: 'Analysis not found' });
    res.status(200).json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
