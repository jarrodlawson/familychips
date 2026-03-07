import { NextRequest, NextResponse } from 'next/server';
import { getPlayers, createPlayer } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const players = await getPlayers();
  return NextResponse.json(players);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !await verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const player = await createPlayer(name.trim());
  return NextResponse.json(player, { status: 201 });
}
