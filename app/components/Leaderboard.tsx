'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type { Player } from '@/lib/types';

interface Props {
  initialPlayers: Player[];
}

export default function Leaderboard({ initialPlayers }: Props) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function fetchPlayers() {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('is_active', true)
        .order('chips', { ascending: false });
      if (data) setPlayers(data);
    }

    const channel = supabase
      .channel('players-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchPlayers)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const maxChips = Math.max(...players.map((p) => p.chips), 10);

  return (
    <div className="space-y-3">
      {players.map((player, i) => {
        const isZero = player.chips === 0;
        const pct = Math.round((player.chips / maxChips) * 100);
        const rank = i + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

        return (
          <div
            key={player.id}
            className={`rounded-xl p-4 ${isZero ? 'opacity-60 border border-red-800 bg-red-950/30' : 'bg-[#1e293b]'}`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl w-10 text-center shrink-0">{medal}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-lg truncate">{player.name}</span>
                  <span className={`font-bold text-xl shrink-0 ml-2 ${isZero ? 'text-red-400' : 'text-amber-400'}`}>
                    {isZero ? '🧹 Doing Chores' : `${player.chips} 🪙`}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isZero ? 'bg-red-600' : 'bg-amber-400'}`}
                    style={{ width: `${isZero ? 2 : pct}%` }}
                  />
                </div>
              </div>
              {player.revived_count > 0 && (
                <span className="text-xs text-slate-400 shrink-0">
                  ☠️ ×{player.revived_count}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
