import { NextRequest, NextResponse } from 'next/server';
import { revivePlayer, getPlayer } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !await verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { chips } = await request.json();

  if (typeof chips !== 'number' || chips < 1 || chips > 10) {
    return NextResponse.json({ error: 'chips must be between 1 and 10' }, { status: 400 });
  }

  const player = await getPlayer(id);
  if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  if (player.chips > 0) {
    return NextResponse.json({ error: 'Player is not at zero chips' }, { status: 400 });
  }

  const updated = await revivePlayer(id, chips);
  return NextResponse.json(updated);
}
