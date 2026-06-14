import { NextResponse } from 'next/server';
import { getPlatformStatus } from '@/lib/health';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  const status = getPlatformStatus();
  return NextResponse.json(status, {
    status: status.ok ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
