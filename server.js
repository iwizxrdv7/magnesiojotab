// server.js - Servidor Local Node.js para o 6 Magnésios + B12 Jota'B
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

// Mapeamento de rotas de API
const apiRoutes = {
  '/api/create-pix': './api/create-pix',
  '/api/create-card': './api/create-card',
  '/api/check-status': './api/check-status',
  '/api/webhook': './api/webhook'
};

function getApiHandler(pathname) {
  const fileRel = apiRoutes[pathname];
  if (!fileRel) return null;
  try {
    const fullPath = require.resolve(fileRel);
    delete require.cache[fullPath];
    return require(fileRel);
  } catch (e) {
    console.error(`Erro ao carregar handler para ${pathname}:`, e);
    return null;
  }
}

// Helper para emular ambiente Serverless
function createServerlessAdapters(req, res) {
  const parsedUrl = new URL(req.url, 'http://localhost');
  const queryObj = {};
  parsedUrl.searchParams.forEach((v, k) => { queryObj[k] = v; });
  req.query = queryObj;

  res.status = function(code) {
    res.statusCode = code;
    return res;
  };

  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, 'http://localhost');
  let pathname = parsedUrl.pathname;

  // Roteamento de APIs
  const handler = getApiHandler(pathname);
  if (handler) {
    createServerlessAdapters(req, res);

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      let bodyData = '';
      req.on('data', chunk => {
        bodyData += chunk;
      });
      req.on('end', async () => {
        try {
          req.body = bodyData ? JSON.parse(bodyData) : {};
        } catch {
          req.body = bodyData;
        }
        try {
          await handler(req, res);
        } catch (err) {
          console.error(`Erro ao executar handler para ${pathname}:`, err);
          if (!res.writableEnded) {
            res.status(500).json({ success: false, error: err.message });
          }
        }
      });
      return;
    } else {
      try {
        await handler(req, res);
      } catch (err) {
        console.error(`Erro ao executar handler para ${pathname}:`, err);
        if (!res.writableEnded) {
          res.status(500).json({ success: false, error: err.message });
        }
      }
      return;
    }
  }

  // Roteamento de Arquivos Estáticos
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, decodeURIComponent(pathname));

  // Previne Directory Traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Se for diretório, tenta index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Se não tem extensão e não existe, tenta adicionar .html (Clean URLs)
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 - Página Não Encontrada</h1><p><a href="/">Voltar à Página Inicial</a></p>');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`500 Internal Server Error: ${err.code}`);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor Jota'B rodando em http://localhost:${PORT}`);
  console.log(`💳 Gateway ativo em /api/create-pix, /api/create-card, /api/check-status, /api/webhook`);
});
