import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import server from './dist/server/server.js'

const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? '0.0.0.0'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDir = path.resolve(__dirname, 'dist', 'client')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
}

async function tryServeStatic(urlPath, res) {
  const cleanPath = urlPath.replace(/^\/+/, '')
  const filePath = path.join(clientDir, cleanPath)
  try {
    const stat = await fs.stat(filePath)
    if (!stat.isFile()) return false
    const ext = path.extname(filePath).toLowerCase()
    const type = MIME_TYPES[ext] ?? 'application/octet-stream'
    const cacheHeader = cleanPath.startsWith('assets/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=0'
    const data = await fs.readFile(filePath)
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': cacheHeader,
    })
    res.end(data)
    return true
  } catch {
    return false
  }
}

const httpServer = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
    if (req.method === 'GET' || req.method === 'HEAD') {
      const staticCandidates = [
        url.pathname.startsWith('/assets/'),
        url.pathname === '/favicon.ico',
        url.pathname === '/robots.txt',
      ]
      if (staticCandidates.some(Boolean)) {
        const served = await tryServeStatic(url.pathname, res)
        if (served) return
      }
    }

    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body:
        req.method && !['GET', 'HEAD'].includes(req.method) ? req : undefined,
    })

    const response = await server.fetch(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    const buffer = Buffer.from(await response.arrayBuffer())
    res.end(buffer)
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
    // eslint-disable-next-line no-console
    console.error('SSR server error:', err)
  }
})

httpServer.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 SSR running on http://${HOST}:${PORT}`)
})
