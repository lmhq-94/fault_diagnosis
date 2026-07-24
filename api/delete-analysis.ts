import { readAnalysis, deleteAnalysisFile } from './_blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const existing = await readAnalysis();
    if (!existing) return res.status(404).json({ error: 'Analysis not found' });
    await deleteAnalysisFile();
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
