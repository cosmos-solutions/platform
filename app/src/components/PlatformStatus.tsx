'use client';

import { useEffect, useState } from 'react';
import type { PlatformStatus } from '@/lib/health';

const FALLBACK: PlatformStatus = {
  ok: false,
  service: 'cosmos-platform',
  version: '0.1.0',
  environment: 'unknown',
  checks: {
    runtime: { ok: false, message: 'not yet loaded' },
  },
  timestamp: new Date(0).toISOString(),
};

export function PlatformStatusCard() {
  const [status, setStatus] = useState<PlatformStatus>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/health', { cache: 'no-store' })
      .then(async (res) => {
        const body = (await res.json()) as PlatformStatus;
        if (!cancelled) {
          setStatus(body);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dot = loaded && status.ok ? 'bg-emerald-500' : 'bg-amber-500';
  const label =
    !loaded
      ? 'Checking platform…'
      : status.ok
        ? 'All systems operational'
        : 'Platform needs attention';

  return (
    <section
      className="w-full rounded-lg border border-border bg-muted p-6 shadow-sm"
      data-testid="platform-status"
      data-ok={status.ok}
    >
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
        <h2 className="text-lg font-medium">{label}</h2>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Service</dt>
          <dd className="font-mono">{status.service}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Version</dt>
          <dd className="font-mono">{status.version}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Environment</dt>
          <dd className="font-mono">{status.environment}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last checked</dt>
          <dd className="font-mono">{status.timestamp}</dd>
        </div>
      </dl>
      <ul className="mt-4 space-y-1 text-sm">
        {Object.entries(status.checks).map(([name, result]) => (
          <li key={name} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{name}</span>
            <span
              className={result.ok ? 'text-emerald-600' : 'text-amber-600'}
              data-check={name}
              data-ok={result.ok}
            >
              {result.message}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
