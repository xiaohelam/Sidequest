/**
 * Serves the built site and POST /api/ai on port 4187.
 * The dev server exposes the same route. This one is what a refresh of the site uses.
 */

import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { handleAiHttp } from './openai.mjs'

const root = resolve(process.cwd(), 'dist')
const host = '127.0.0.1'
const port = Number(process.env.PORT) || 4187

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
}

function fileFor(urlPath) {
  let pathname = decodeURIComponent(urlPath.split('?')[0] || '/')
  if (pathname.endsWith('/')) pathname += 'index.html'
  const file = normalize(join(root, pathname))
  if (!file.startsWith(root)) return null
  if (existsSync(file) && statSync(file).isFile()) return file
  return join(root, 'index.html')
}

const server = createServer((req, res) => {
  if ((req.url ?? '').split('?')[0] === '/api/ai') {
    void handleAiHttp(req, res)
    return
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405)
    res.end()
    return
  }
  const file = fileFor(req.url ?? '/')
  if (!file || !existsSync(file)) {
    res.writeHead(404)
    res.end('Not found')
    return
  }
  res.writeHead(200, {
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(file).pipe(res)
})

server.listen(port, host, () => {
  console.log(`Sidequest site http://${host}:${port}`)
})
