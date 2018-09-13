const connect = require('connect');
const serveStatic = require('serve-static');

const port = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 8080;
const buildDir = `${__dirname}/build`;

const setContentType = (response, path) => {
  const ext = path.split('.').pop().toLowerCase();
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
};

const setHeaders = (response, path) => {
  setContentType(response, path);
};

console.log(`Serving HTTP on http://localhost:${port} ...`);
connect()
  .use(serveStatic(buildDir, { 'setHeaders': setHeaders }))
  .use((request, response, next) => {
    const url = request.url;
    console.log('404 Not Found', url);
    next();
  })
  .listen(port);