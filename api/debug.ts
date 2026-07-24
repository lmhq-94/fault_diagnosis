import { head, get, put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const results: Record<string, any> = {
    hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10) + '...',
  };
  try {
    await put('test-' + Date.now() + '.json', JSON.stringify({ hello: 'world' }), {
      contentType: 'application/json',
      access: 'private',
      addRandomSuffix: false,
    });
    results.put = 'ok';
  } catch (e: any) {
    results.put = { error: e.message, stack: e.stack?.split('\n').slice(0, 3).join(' | ') };
  }
  try {
    const h = await head('test.json');
    results.head = h ? 'exists' : 'not found';
  } catch (e: any) {
    results.head = { error: e.message };
  }
  try {
    const g = await get('test.json', { access: 'private' });
    results.get = g ? 'found' : 'not found';
  } catch (e: any) {
    results.get = { error: e.message };
  }
  res.status(200).json(results);
}
