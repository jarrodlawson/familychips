'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Player } from '@/lib/types';

interface Props {
  player: Player;
}

export default function PlayerCard({ player }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function adjust(amount: number, type: string, note?: string) {
    setLoading(true);
    await fetch(`/api/players/${player.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, type, note: note ?? null }),
    });
    router.refresh();
    setLoading(false);
  }

  const isZero = player.chips === 0;

  return (
    <div className={`bg-[#1e293b] rounded-xl p-4 ${isZero ? 'border border-red-800' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <Link
            href={`/admin/players/${player.id}`}
            className="font-semibold hover:text-amber-400 transition-colors"
          >
            {player.name}
          </Link>
          {player.revived_count > 0 && (
            <span className="text-xs text-slate-500 ml-2">☠️ ×{player.revived_count}</span>
          )}
        </div>
        <span className={`font-bold text-lg ${isZero ? 'text-red-400' : 'text-amber-400'}`}>
          {player.chips} 🪙
        </span>
      </div>

      {isZero ? (
        <div className="flex gap-2">
          <Link
            href={`/admin/players/${player.id}`}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-center font-bold py-2 rounded-lg text-sm transition-colors"
          >
            🔄 Revive
          </Link>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => adjust(-1, 'adjustment')}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold w-10 h-10 rounded-lg text-lg transition-colors disabled:opacity-50"
          >
            −
          </button>
          <button
            onClick={() => adjust(1, 'adjustment')}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold w-10 h-10 rounded-lg text-lg transition-colors disabled:opacity-50"
          >
            +
          </button>
          <Link
            href={`/admin/players/${player.id}`}
            className="ml-auto text-xs text-slate-400 hover:text-slate-200 self-center transition-colors"
          >
            Full controls →
          </Link>
        </div>
      )}
    </div>
  );
}
