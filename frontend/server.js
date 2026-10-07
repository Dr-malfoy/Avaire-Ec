const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Ensure NODE_ENV is production if not explicitly set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';


const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || '0.0.0.0';

const fs = require('fs');

// Automatically fix Linux permissions for .next build directory recursively on boot
function autoFixPermissions(targetPath) {
  try {
    if (!fs.existsSync(targetPath)) return;
    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
      try { fs.chmodSync(targetPath, 0o755); } catch (e) {}
      const entries = fs.readdirSync(targetPath, { withFileTypes: true });
      for (const entry of entries) {
        autoFixPermissions(path.join(targetPath, entry.name));
      }
    } else {
      try { fs.chmodSync(targetPath, 0o644); } catch (e) {}
    }
  } catch (err) {}
}

// Fix permissions before Next.js starts
autoFixPermissions(path.resolve(__dirname, '.next'));

const app = next({
  dev,
  dir: path.resolve(__dirname),
  hostname,
  port: typeof port === 'string' && !isNaN(Number(port)) ? Number(port) : port,
});

const handle = app.getRequestHandler();
let isReady = false;
let prepareError = null;
const requestQueue = [];

// Prepare Next.js in background
app.prepare()
  .then(() => {
    isReady = true;
    console.log(`> Next.js prepared successfully (mode: ${process.env.NODE_ENV})`);
    while (requestQueue.length > 0) {
      const { req, res, parsedUrl } = requestQueue.shift();
      handle(req, res, parsedUrl).catch((err) => {
        console.error('Error handling queued request:', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
    }
  })
  .catch((err) => {
    prepareError = err;
    console.error('Failed to prepare Next.js app:', err);
    while (requestQueue.length > 0) {
      const { res } = requestQueue.shift();
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Application failed to initialize:\n\n${err.stack || err.message || err}`);
      }
    }
  });

// Create and listen immediately so Passenger/LiteSpeed never gets a 503 gateway timeout
const server = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url, true);

    if (prepareError) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`Application Initialization Error:\n\n${prepareError.stack || prepareError.message || prepareError}`);
      return;
    }

    if (!isReady) {
      // Queue request until Next.js is ready
      requestQueue.push({ req, res, parsedUrl });
      return;
    }

    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('Error occurred handling', req.url, err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
});

server.once('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`> Server listening on port ${port} (mode: ${process.env.NODE_ENV})`);
});
