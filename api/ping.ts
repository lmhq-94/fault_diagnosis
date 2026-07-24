import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ pong: true, token: !!process.env.BLOB_READ_WRITE_TOKEN });
}
