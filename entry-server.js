import http from "node:http"
import { server } from "./dist/server/server.js"

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "0.0.0.0"

const httpServer = http.createServer(async (req, res) => {
  const url = `http://${req.headers.host}${req.url}`
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
  })

  const response = await server.fetch(request)

  res.writeHead(response.status, Object.fromEntries(response.headers))
  const buffer = Buffer.from(await response.arrayBuffer())
  res.end(buffer)
})

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 SSR running on http://${HOST}:${PORT}`)
})