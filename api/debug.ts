import { head, put, get, del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const testFile = 'test-' + Date.now() + '.json';
    await put(testFile, JSON.stringify({ hello: 'world' }), {
      contentType: 'application/json',
      access: 'private',
      addRandomSuffix: false,
    });
    const blob = await get(testFile);
    const text = await blob!.text();
    await del(testFile);
    res.status(200).json({ success: true, data: JSON.parse(text) });
  } catch (err: any) {
    res.status(200).json({ success: false, error: err.message, stack: err.stack?.split('\n').slice(0, 3).join('\\n') });
  }
}
