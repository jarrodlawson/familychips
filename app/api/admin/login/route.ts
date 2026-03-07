import { NextRequest, NextResponse } from 'next/server';
import { checkAdminPassword, generateSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await generateSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // 7 day session
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
