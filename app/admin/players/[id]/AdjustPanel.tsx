'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Player } from '@/lib/types';

const TRANSACTION_TYPES = [
  { value: 'adjustment', label: 'Manual Adjustment' },
  { value: 'wager_win', label: 'Wager Win' },
  { value: 'wager_loss', label: 'Wager Loss' },
  { value: 'barter', label: 'Barter' },
];

export default function AdjustPanel({ player }: { player: Player }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('adjustment');
  const [note, setNote] = useState('');
  const [reviveChips, setReviveChips] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const isZero = player.chips === 0;

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(amount);
    if (isNaN(n) || n === 0) { setError('Enter a non-zero amount'); return; }
    setLoading(true);
    setError('');

    const res = await fetch(`/api/players/${player.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: n, type, note: note || null }),
    });

    if (res.ok) {
      setAmount('');
      setNote('');
      router.refresh();
    } else {
      setError('Failed to adjust chips');
    }
    setLoading(false);
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
      router.refresh();
    } else {
      setError('Failed to revive player');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {isZero && (
        <div className="bg-red-950/40 border border-red-800 rounded-2xl p-5">
          <h2 className="font-bold text-red-300 mb-3">🧹 Player is Bust — Revive?</h2>
          <p className="text-sm text-slate-400 mb-4">
            Once they&apos;ve done their chore, award their revival chips (1–10).
          </p>
          <form onSubmit={handleRevive} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-slate-400 block mb-1">Revival Chips</label>
              <input
                type="range"
                min={1}
                max={10}
                value={reviveChips}
                onChange={(e) => setReviveChips(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="text-center font-bold text-amber-400 text-lg">{reviveChips} 🪙</div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Revive!'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-[#1e293b] rounded-2xl p-5">
        <h2 className="font-bold mb-4">Adjust Chips</h2>
        <form onSubmit={handleAdjust} className="space-y-3">
          <div className="flex gap-2">
            {[-5, -3, -1, 1, 3, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                  v < 0
                    ? 'bg-red-900/50 hover:bg-red-800/50 text-red-300'
                    : 'bg-green-900/50 hover:bg-green-800/50 text-green-300'
                } ${amount === String(v) ? 'ring-2 ring-amber-400' : ''}`}
              >
                {v > 0 ? '+' : ''}{v}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Or enter custom amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. -3 or +7"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
            >
              {TRANSACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lost at blackjack"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Apply Adjustment'}
          </button>
        </form>
      </div>
    </div>
  );
}
