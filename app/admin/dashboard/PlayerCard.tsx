'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Player } from '@/lib/types';

const PRESETS = [5, 10, 20, 50];

interface Props {
  player: Player;
}

export default function PlayerCard({ player }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviveChips, setReviveChips] = useState(5);
  const router = useRouter();

  const isBust = player.chips === 0 && !player.is_playing;

  async function cashOut() {
    const n = parseInt(amount);
    if (!n || n <= 0) { setError('Enter a valid amount'); return; }
    setLoading(true);
    setError('');
    const res = await fetch(`/api/players/${player.id}/cash-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: n }),
    });
    if (res.ok) {
      setAmount('');
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Failed to cash out');
    }
    setLoading(false);
  }

  async function cashIn(chipsReturned: number) {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/players/${player.id}/cash-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: chipsReturned }),
    });
    if (res.ok) {
      setAmount('');
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Failed to cash in');
    }
    setLoading(false);
  }

  async function handleCashIn() {
    const n = parseInt(amount);
    if (isNaN(n) || n < 0) { setError('Enter a valid amount'); return; }
    await cashIn(n);
  }

  async function handleRevive(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`/api/players/${player.id}/revive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chips: reviveChips }),
    });
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError('Failed to revive player');
    }
    setLoading(false);
  }

  return (
    <div className={`bg-[#1e293b] rounded-xl overflow-hidden ${isBust ? 'border border-red-800' : ''}`}>
      {/* Header row */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/players/${player.id}`}
            className="font-semibold hover:text-amber-400 transition-colors"
          >
            {player.name}
          </Link>
          {player.revived_count > 0 && (
            <span className="text-xs text-slate-500">☠️ ×{player.revived_count}</span>
          )}
          {player.is_playing && (
            <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full">
              🎲 Playing
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-bold text-lg ${isBust ? 'text-red-400' : 'text-amber-400'}`}>
            {player.chips} 🪙
          </span>
          <button
            onClick={() => { setOpen(!open); setError(''); setAmount(''); }}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            {open ? 'Close ▲' : 'Manage ▼'}
          </button>
        </div>
      </div>

      {/* Expandable panel */}
      {open && (
        <div className="border-t border-slate-700 p-4 space-y-3">
          {isBust ? (
            /* Revival section */
            <div>
              <p className="text-sm text-slate-400 mb-3">
                🧹 Assign revival chips once the chore is done.
              </p>
              <form onSubmit={handleRevive} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Revival chips: <span className="text-amber-400 font-bold">{reviveChips} 🪙</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={reviveChips}
                    onChange={(e) => setReviveChips(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : '🔄 Revive!'}
                </button>
              </form>
            </div>
          ) : player.is_playing ? (
            /* Cash In section */
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Cash In — how many chips are they returning?
              </p>
              <div className="flex gap-2 flex-wrap mb-3">
                <button
                  onClick={() => cashIn(0)}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg text-sm font-bold bg-red-900/50 hover:bg-red-800/50 text-red-300 transition-colors disabled:opacity-50"
                >
                  Bust
                </button>
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(String(p))}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg text-sm font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-50 ${amount === String(p) ? 'ring-2 ring-amber-400' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleCashIn}
                  disabled={loading}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : 'Cash In'}
                </button>
              </div>
            </div>
          ) : (
            /* Cash Out section */
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Cash Out — how many chips for this session?
              </p>
              <div className="flex gap-2 flex-wrap mb-3">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(String(p))}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg text-sm font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-50 ${amount === String(p) ? 'ring-2 ring-amber-400' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={cashOut}
                  disabled={loading}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : 'Cash Out'}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}
