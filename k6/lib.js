import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

export const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3100';
const JSON_HEADERS = { headers: { 'content-type': 'application/json' } };

// Business-level metric, so the checkout journey has its own SLO.
const orderJourney = new Trend('order_journey_duration', true);

/** One user journey: place an order, then read it back. */
export function orderJourneyStep() {
  const started = Date.now();
  const created = http.post(
    `${BASE_URL}/orders`,
    JSON.stringify({ sku: 'TONER-1', quantity: 1 }),
    { ...JSON_HEADERS, tags: { name: 'POST /orders' } },
  );
  const ok = check(created, { 'order created': (r) => r.status === 201 });
  if (ok) {
    const read = http.get(`${BASE_URL}/orders/${created.json('id')}`, { tags: { name: 'GET /orders/:id' } });
    check(read, {
      'order readable': (r) => r.status === 200,
      'order matches': (r) => r.json('sku') === 'TONER-1',
    });
  }
  orderJourney.add(Date.now() - started);
}

/** Service-level objectives. Crossing any of these fails the run, with exit code 99. */
export const SLOS = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<200', 'p(99)<400'],
  'http_req_duration{name:POST /orders}': ['p(95)<250'],
  order_journey_duration: ['p(95)<500'],
  checks: ['rate>0.99'],
};

export function setup() {
  const health = http.get(`${BASE_URL}/health`);
  if (health.status !== 200) throw new Error(`Target is not healthy: ${health.status}`);
}
