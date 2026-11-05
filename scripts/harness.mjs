import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const K6 = process.env.K6_PATH || 'k6';

export async function startServer(env = {}) {
  const port = String(env.PORT ?? process.env.PORT ?? 3100);
  const server = spawn(process.execPath, ['server/server.js'], {
    env: { ...process.env, ...env, PORT: port },
    stdio: 'ignore',
  });
  const url = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      if ((await fetch(`${url}/health`)).ok) return { url, stop: () => server.kill() };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  server.kill();
  throw new Error('The target server did not start.');
}

/** Runs a k6 script and returns its exit code. */
export function runK6(script, url, extraArgs = []) {
  mkdirSync('results', { recursive: true });
  const { status, error } = spawnSync(
    K6,
    ['run', '--quiet', '--summary-export', `results/${script}.json`, '-e', `BASE_URL=${url}`, ...extraArgs, `k6/${script}.js`],
    { stdio: 'inherit' },
  );
  if (error) throw new Error(`Could not run k6 (${error.message}). Install it from https://grafana.com/docs/k6/latest/set-up/install-k6/`);
  return status;
}
