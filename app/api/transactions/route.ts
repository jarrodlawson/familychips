import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/lib/db';

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('playerId') ?? undefined;
  const transactions = await getTransactions(playerId);
  return NextResponse.json(transactions);
}
