import { sleep } from 'k6';
import { orderJourneyStep, SLOS } from './lib.js';
export { setup } from './lib.js';

// Expected peak traffic: ramp up, hold, ramp down.
export const options = {
  scenarios: {
    expected_peak: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 20 },
        { duration: '30s', target: 20 },
        { duration: '5s', target: 0 },
      ],
    },
  },
  thresholds: SLOS,
};

export default function () {
  orderJourneyStep();
  sleep(0.5);
}
