/**
 * Vercel serverless entry for the same /api/ai route the dev server and the local site use.
 */
import { handleAiHttp } from '../server/openai.mjs'

export default function handler(req, res) {
  const url = req.url ?? ''
  if (url === '' || url === '/' || url.startsWith('/?')) req.url = '/api/ai'
  return handleAiHttp(req, res)
}
