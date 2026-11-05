# k6 Performance Gates

![performance](https://github.com/rovil111/k6-performance-gates/actions/workflows/performance.yml/badge.svg)

Load tests written as code, with service-level objectives that fail the build when breached. A bundled target API means it runs anywhere with no environment to set up.

## Run it

Requires Node.js 20 or later and [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/). On Windows, `winget install k6 --source winget`.

```bash
npm run smoke        # 2 users for 10 seconds
npm run load         # ramp to 20 users, hold, ramp down
npm run spike        # burst to 200 journeys per second
npm run prove-gate   # confirms degraded builds get blocked
```

There are no packages to install. Set `K6_PATH` if k6 isn't on your PATH.

## Service-level objectives

| Metric | Objective |
| --- | --- |
| Failed requests | Under 1% |
| Response time, all requests | p95 under 200 ms, p99 under 400 ms |
| Response time, `POST /orders` | p95 under 250 ms |
| Order journey (create, then read back) | p95 under 500 ms |
| Functional checks | Over 99% pass |

The spike test uses looser limits: under 1% failed requests, p95 under 500 ms and fewer than 50 dropped iterations.

## Design decisions

- **Closed and open workload models.** Load uses a fixed number of users. Spike uses a fixed arrival rate, so a slow server can't hide by receiving less traffic.
- **A business-level metric.** The order journey has its own trend, not just per-request timings.
- **Proof that the gate works.** `prove-gate` starts the target with injected latency, then with injected errors, and passes only if k6 exits with its threshold-breach code.

The objectives here suit the bundled target. On a real system, derive them from production data and agreed SLAs.
