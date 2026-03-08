import { NextRequest, NextResponse } from 'next/server';
import { cashIn } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token ? await verifySessionToken(token) : false;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { amount } = await request.json();

  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0) {
    return NextResponse.json({ error: 'amount must be a non-negative integer' }, { status: 400 });
  }

  try {
    const player = await cashIn(id, amount);
    return NextResponse.json(player);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to cash in';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
