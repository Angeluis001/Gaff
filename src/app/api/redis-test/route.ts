import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// TEMPORARY — delete this file before closing Plan 01-02
export async function GET() {
  if (!redis) {
    return NextResponse.json({ ok: false, configured: false }, { status: 503 });
  }

  await redis.set('gaff:ping', 'pong', { ex: 60 });
  const value = await redis.get('gaff:ping');
  return NextResponse.json({ ok: value === 'pong', configured: true });
}
