import { readAnalysis, writeAnalysis } from './_blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const existing = await readAnalysis();
    if (!existing) return res.status(404).json({ error: 'Analysis not found' });
    await writeAnalysis(req.body);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
