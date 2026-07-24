import { get, del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BLOB_FILENAME = 'analysis.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ blobUnavailable: true });
  }

  try {
    const existing = await get(BLOB_FILENAME, { access: 'private' });
    if (!existing) {
      return res.status(200).json({ blobUnavailable: true, error: 'Analysis not found' });
    }
    await del(BLOB_FILENAME);
    res.status(200).json({ success: true });
  } catch {
    res.status(200).json({ blobUnavailable: true });
  }
}
