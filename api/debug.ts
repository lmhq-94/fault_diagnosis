import { head, put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const NAME = 'analysis.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const r: Record<string, any> = { token: !!process.env.BLOB_READ_WRITE_TOKEN };

  // Step 1: put
  try {
    const result = await put(NAME, JSON.stringify({ savedAt: new Date().toISOString(), data: { test: true } }), {
      contentType: 'application/json',
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    r.putResult = { url: result.url?.substring(0, 80), pathname: result.pathname };
  } catch (e: any) {
    r.putError = e.message;
  }

  // Step 2: head with same pathname
  try {
    const meta = await head(NAME);
    r.headResult = meta ? 'found' : 'null';
    if (meta) {
      r.headPathname = meta.pathname;
      r.headUrl = meta.url?.substring(0, 80);
      r.headDownloadUrl = meta.downloadUrl?.substring(0, 80);
    }
  } catch (e: any) {
    r.headError = e.message;
  }

  // Step 3: head with returned pathname (if different)
  if (r.putResult?.pathname && r.putResult.pathname !== NAME) {
    try {
      const meta = await head(r.putResult.pathname);
      r.headWithPathname = meta ? 'found' : 'null';
    } catch (e: any) {
      r.headWithPathnameError = e.message;
    }
  }

  // Step 4: fetch downloadUrl
  if (r.headResult === 'found') {
    try {
      const resp = await fetch(r.headDownloadUrl);
      r.fetchStatus = resp.status;
      r.fetchOk = resp.ok;
      r.fetchBody = await resp.text().then(t => t.substring(0, 200)).catch(() => 'read error');
    } catch (e: any) {
      r.fetchError = e.message;
    }
  }

  res.status(200).json(r);
}
