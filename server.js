const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, 'public');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

function reply(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  // Static files arrive from fs.readFile as Buffers. Send those bytes as-is;
  // JSON.stringify(Buffer) produces the { type: "Buffer", data: [...] } text
  // that a browser would display instead of rendering the page.
  res.end(Buffer.isBuffer(body) ? body : typeof body === 'string' ? body : JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, 'http://localhost');

  if (req.method === 'POST' && requestUrl.pathname === '/api/generate') {
    if (!process.env.OPENAI_API_KEY) {
      return reply(res, 503, { error: 'AI generation is not configured. Set OPENAI_API_KEY on the server, then restart it.' });
    }
    try {
      const { prompt, count = 1, background = 'transparent', quality = 'medium', size = '1024x1024' } = await readBody(req);
      if (!prompt || typeof prompt !== 'string') return reply(res, 400, { error: 'A design prompt is required.' });
      const n = Math.max(1, Math.min(3, Number(count) || 1));
      const safeBackground = ['transparent', 'opaque', 'auto'].includes(background) ? background : 'transparent';
      const safeQuality = ['low', 'medium', 'high'].includes(quality) ? quality : 'medium';
      const safeSize = ['1024x1024', '1536x1024', '1024x1536'].includes(size) ? size : '1024x1024';
      const safetyIdentifier = crypto.createHash('sha256').update(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous').digest('hex').slice(0, 64);
      const aiResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-image-2.5-sunburst', prompt, n, size: safeSize, quality: safeQuality, background: safeBackground, output_format: 'png', safety_identifier: safetyIdentifier })
      });
      const data = await aiResponse.json();
      if (!aiResponse.ok) return reply(res, aiResponse.status, { error: data.error?.message || 'OpenAI image generation failed.' });
      const images = (data.data || []).map(item => item.b64_json ? `data:image/png;base64,${item.b64_json}` : null).filter(Boolean);
      if (!images.length) return reply(res, 502, { error: 'The image service returned no image.' });
      return reply(res, 200, { images });
    } catch (error) {
      return reply(res, 500, { error: error.message || 'Could not create the artwork.' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return reply(res, 405, { error: 'Method not allowed' });
  const safePath = path.normalize(path.join(root, requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname));
  if (!safePath.startsWith(root)) return reply(res, 403, 'Forbidden', 'text/plain');
  fs.readFile(safePath, (err, content) => {
    if (err) return reply(res, 404, 'Not found', 'text/plain');
    reply(res, 200, content, mime[path.extname(safePath)] || 'application/octet-stream');
  });
});

server.listen(process.env.PORT || 3000, () => console.log('FireworkBox MVP running at http://localhost:3000'));

