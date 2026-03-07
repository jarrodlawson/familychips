import { NextRequest, NextResponse } from 'next/server';
import { adjustChips, deactivatePlayer } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token ? await verifySessionToken(token) : false;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { amount, type, note } = await request.json();

  if (typeof amount !== 'number' || amount === 0) {
    return NextResponse.json({ error: 'amount must be a non-zero number' }, { status: 400 });
  }

  const validTypes = ['adjustment', 'revival', 'wager_win', 'wager_loss', 'barter', 'initial'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const player = await adjustChips(id, amount, type, note ?? null);
  return NextResponse.json(player);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await deactivatePlayer(id);
  return NextResponse.json({ ok: true });
}
