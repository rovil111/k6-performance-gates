import { sleep } from 'k6';
import { orderJourneyStep, SLOS } from './lib.js';
export { setup } from './lib.js';

// Quick sanity check: does the system work at all under minimal traffic?
export const options = { vus: 2, duration: '10s', thresholds: SLOS };

export default function () {
  orderJourneyStep();
  sleep(0.2);
}
