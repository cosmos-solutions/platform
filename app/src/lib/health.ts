export type Env = Record<string, string | undefined>;

export type PlatformStatus = {
  ok: boolean;
  service: string;
  version: string;
  environment: string;
  checks: Record<string, CheckResult>;
  timestamp: string;
};

export type CheckResult = {
  ok: boolean;
  message: string;
};

const SERVICE = 'cosmos-platform';
const VERSION = '0.1.0';

export function getPlatformStatus(
  env: Env = process.env,
  now: () => Date = () => new Date(),
): PlatformStatus {
  const environment = env['NODE_ENV'] ?? 'development';
  const checks: Record<string, CheckResult> = {
    runtime: {
      ok: true,
      message: `node ${process.versions.node}`,
    },
    database: {
      ok: Boolean(env['DATABASE_URL']),
      message: env['DATABASE_URL'] ? 'DATABASE_URL set' : 'DATABASE_URL not set',
    },
    auth: {
      ok: Boolean(env['AUTH_SECRET']),
      message: env['AUTH_SECRET'] ? 'AUTH_SECRET set' : 'AUTH_SECRET not set',
    },
  };

  const ok = Object.values(checks).every((c) => c.ok);

  return {
    ok,
    service: SERVICE,
    version: VERSION,
    environment,
    checks,
    timestamp: now().toISOString(),
  };
}
