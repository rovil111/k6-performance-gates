// A performance gate that never fails proves nothing. This runs the smoke test against
// deliberately degraded builds and passes only if k6 reports a threshold breach (exit 99).
import { runK6, startServer } from './harness.mjs';

const THRESHOLD_BREACH = 99;
const degradedBuilds = [
  { name: 'slow responses', env: { SLOW_MS: '300' } },
  { name: '5% server errors', env: { ERROR_RATE: '0.05' } },
];

let allCaught = true;
for (const { name, env } of degradedBuilds) {
  console.log(`\n=== Degraded build: ${name} ===`);
  const server = await startServer({ ...env, PORT: '3101' });
  const code = runK6('smoke', server.url);
  server.stop();
  await new Promise((resolve) => setTimeout(resolve, 300));
  const caught = code === THRESHOLD_BREACH;
  console.log(caught ? `CAUGHT: gate failed the "${name}" build.` : `MISSED: exit code ${code}.`);
  allCaught &&= caught;
}
console.log(allCaught ? '\nGate verified: every degraded build was blocked.' : '\nGate check failed.');
process.exit(allCaught ? 0 : 1);
