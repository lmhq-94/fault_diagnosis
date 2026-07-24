import { writeAnalysis } from './_blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await writeAnalysis(req.body);
    res.status(200).json({ success: true, id: 'analisis', filename: 'analysis.json' });
  } catch {
    res.status(200).json({ blobUnavailable: true });
  }
}
