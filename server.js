// Zero-dependency static file server — uses only Node's built-in modules.
// This is what lets the final distroless image skip node_modules entirely
// at runtime: no express, no "serve" package, nothing beyond the Node
// interpreter itself and this ~40-line script.
const http = require('http')
const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(__dirname, 'dist')
const PORT = 8080

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, decodeURIComponent(req.url.split('?')[0]))

  // Prevent path traversal outside the dist directory.
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403)
    return res.end('Forbidden')
  }

  fs.stat(filePath, (err, stats) => {
    // SPA fallback: any unmatched path (e.g. a client-side route, or just
    // a directory request) serves index.html instead of 404ing.
    if (err || stats.isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html')
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404)
        return res.end('Not found')
      }
      const ext = path.extname(filePath)
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
      res.end(content)
    })
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serving ${DIST_DIR} on port ${PORT}`)
})
