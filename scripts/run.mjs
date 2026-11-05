import { runK6, startServer } from './harness.mjs';

const script = process.argv[2];
if (!['smoke', 'load', 'spike'].includes(script)) {
  console.error('Usage: node scripts/run.mjs <smoke|load|spike>');
  process.exit(2);
}
const server = await startServer();
const code = runK6(script, server.url);
server.stop();
process.exit(code ?? 1);
