import { NextRequest, NextResponse } from 'next/server';
import { deactivatePlayer } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token ? await verifySessionToken(token) : false;
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await deactivatePlayer(id);
  return NextResponse.json({ ok: true });
}
