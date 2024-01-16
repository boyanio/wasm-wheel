const connect = require('connect');
const serveStatic = require('serve-static');
const path = require('path');
const https = require('https');
const fs = require('fs');

const port = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 8080;
const rootDir = path.resolve(__dirname, '../');
const buildDir = path.resolve(rootDir, 'dist');

const setContentType = (response, requestPath) => {
  const ext = path.extname(requestPath).toLowerCase().substring(1);
  let contentType;
  switch (ext) {
    case 'wasm':
      contentType = 'application/wasm';
      break;

    case 'js':
      contentType = 'text/javascript';
      break;

    case 'html':
    case 'css':
      contentType = `text/${ext}`;
      break;
  }

  if (contentType) {
    response.setHeader('Content-Type', contentType);
  }

  const filename = path.basename(requestPath);
  if (filename === 'index.html') {
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  }
};

const setHeaders = (response, path) => setContentType(response, path);

const options = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem'),
};

console.log(`Serving HTTPS on https://localhost:${port} ...`);
const app = connect()
  .use(serveStatic(buildDir, { setHeaders }))
  .use((request, response, next) => {
    const url = request.url;
    console.log('404 Not Found', url);
    next();
  });

https.createServer(options, app).listen(port);
