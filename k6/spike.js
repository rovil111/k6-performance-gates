import { orderJourneyStep } from './lib.js';
export { setup } from './lib.js';

// Sudden burst at a fixed arrival rate. An open model keeps sending requests
// even when the server slows down, which is how real traffic behaves.
export const options = {
  scenarios: {
    burst: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '5s', target: 10 },
        { duration: '5s', target: 200 },
        { duration: '10s', target: 200 },
        { duration: '5s', target: 10 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    dropped_iterations: ['count<50'],
  },
};

export default function () {
  orderJourneyStep();
}
