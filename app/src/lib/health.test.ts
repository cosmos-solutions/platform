import { describe, it, expect } from 'vitest';
import { getPlatformStatus } from './health';

describe('getPlatformStatus', () => {
  const fixedNow = new Date('2026-06-14T00:00:00.000Z');

  it('reports ok=true when every env var is set', () => {
    const status = getPlatformStatus(
      {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://localhost:5432/x',
        AUTH_SECRET: 'secret',
      },
      () => fixedNow,
    );

    expect(status.ok).toBe(true);
    expect(status.service).toBe('cosmos-platform');
    expect(status.version).toBe('0.1.0');
    expect(status.environment).toBe('test');
    expect(status.checks.runtime?.ok).toBe(true);
    expect(status.checks.database?.ok).toBe(true);
    expect(status.checks.auth?.ok).toBe(true);
    expect(status.timestamp).toBe(fixedNow.toISOString());
  });

  it('reports ok=false when DATABASE_URL is missing', () => {
    const status = getPlatformStatus(
      { NODE_ENV: 'test', AUTH_SECRET: 'secret' },
      () => fixedNow,
    );
    expect(status.ok).toBe(false);
    expect(status.checks.database?.ok).toBe(false);
    expect(status.checks.database?.message).toMatch(/not set/);
  });

  it('reports ok=false when AUTH_SECRET is missing', () => {
    const status = getPlatformStatus(
      { NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost:5432/x' },
      () => fixedNow,
    );
    expect(status.ok).toBe(false);
    expect(status.checks.auth?.ok).toBe(false);
  });

  it('defaults environment to "development" when NODE_ENV is unset', () => {
    const status = getPlatformStatus(
      { DATABASE_URL: 'postgresql://x', AUTH_SECRET: 's' },
      () => fixedNow,
    );
    expect(status.environment).toBe('development');
  });
});
