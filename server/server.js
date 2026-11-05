// Small orders API used as the load-test target. No dependencies.
// SLOW_MS and ERROR_RATE simulate a degraded release.
import http from 'node:http';

const SLOW_MS = Number(process.env.SLOW_MS ?? 0);
const ERROR_RATE = Number(process.env.ERROR_RATE ?? 0);
const port = Number(process.env.PORT ?? 3100);
const orders = new Map();
let nextId = 1;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

http
  .createServer(async (req, res) => {
    if (req.url === '/health') return send(res, 200, { status: 'ok' });
    if (SLOW_MS) await sleep(SLOW_MS);
    if (Math.random() < ERROR_RATE) return send(res, 500, { error: 'Simulated failure.' });

    if (req.url === '/orders' && req.method === 'POST') {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const { sku, quantity } = JSON.parse(raw || '{}');
      if (!sku || !(quantity > 0)) return send(res, 422, { error: 'sku and quantity are required.' });
      const order = { id: nextId++, sku, quantity, status: 'created' };
      orders.set(order.id, order);
      return send(res, 201, order);
    }
    const match = req.url.match(/^\/orders\/(\d+)$/);
    if (match && req.method === 'GET') {
      const order = orders.get(Number(match[1]));
      return order ? send(res, 200, order) : send(res, 404, { error: 'Not found.' });
    }
    return send(res, 404, { error: 'Not found.' });
  })
  .listen(port, '127.0.0.1', () => console.log(`Target on http://127.0.0.1:${port}`));
