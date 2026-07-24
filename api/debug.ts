import { head, get, put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const NAME = 'analysis.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const results: Record<string, any> = {
    hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
  };
  try {
    await put(NAME, JSON.stringify({ savedAt: new Date().toISOString(), data: { captura: { maquina: 'test' } } }), {
      contentType: 'application/json',
      access: 'private',
      addRandomSuffix: false,
    });
    results.put = 'ok';
  } catch (e: any) {
    results.put = { error: e.message };
  }
  try {
    const h = await head(NAME);
    results.head = h ? 'found' : 'not found';
  } catch (e: any) {
    results.head = { error: e.message };
  }
  try {
    const g = await get(NAME, { access: 'private' });
    if (g) {
      const text = await g.text();
      results.get = JSON.parse(text);
    } else {
      results.get = 'not found';
    }
  } catch (e: any) {
    results.get = { error: e.message };
  }
  res.status(200).json(results);
}
