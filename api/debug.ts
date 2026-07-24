import { head } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const NAME = 'analysis.json';
  const results: Record<string, any> = {};
  try {
    const meta = await head(NAME);
    results.head = meta ? 'found' : 'null';
    if (meta) {
      results.downloadUrl = meta.downloadUrl?.substring(0, 100);
      try {
        const fetchResp = await fetch(meta.downloadUrl);
        results.fetchStatus = fetchResp.status;
        results.fetchOk = fetchResp.ok;
        const text = await fetchResp.text();
        results.fetchLength = text.length;
        if (fetchResp.ok) {
          results.record = JSON.parse(text);
        } else {
          results.fetchBody = text.substring(0, 200);
        }
      } catch (e: any) {
        results.fetchError = e.message;
      }
    }
  } catch (e: any) {
    results.error = e.message;
  }
  res.status(200).json(results);
}
