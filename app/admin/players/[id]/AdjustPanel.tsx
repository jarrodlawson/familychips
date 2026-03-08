'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Player } from '@/lib/types';

const PRESETS = [5, 10, 20, 50];

export default function AdjustPanel({ player }: { player: Player }) {
  const [amount, setAmount] = useState('');
  const [reviveChips, setReviveChips] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const isBust = player.chips === 0 && !player.is_playing;

  async function handleCashOut() {
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
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Failed to cash out');
    }
    setLoading(false);
  }

  async function handleCashIn(chipsReturned?: number) {
    const n = chipsReturned ?? parseInt(amount);
    if (isNaN(n) || n < 0) { setError('Enter a valid amount'); return; }
    setLoading(true);
    setError('');
    const res = await fetch(`/api/players/${player.id}/cash-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: n }),
    });
    if (res.ok) {
      setAmount('');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Failed to cash in');
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
      {isBust && (
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

      {player.is_playing ? (
        <div className="bg-[#1e293b] rounded-2xl p-5">
          <h2 className="font-bold mb-1">💰 Cash In</h2>
          <p className="text-sm text-slate-400 mb-4">
            How many chips is the player returning from this session?
          </p>
          <div className="flex gap-2 flex-wrap mb-3">
            <button
              onClick={() => handleCashIn(0)}
              disabled={loading}
              className="px-3 py-2 rounded-lg text-sm font-bold bg-red-900/50 hover:bg-red-800/50 text-red-300 transition-colors disabled:opacity-50"
            >
              Bust (0)
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
              onClick={() => handleCashIn()}
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Cash In'}
            </button>
          </div>
        </div>
      ) : !isBust && (
        <div className="bg-[#1e293b] rounded-2xl p-5">
          <h2 className="font-bold mb-1">🎰 Cash Out</h2>
          <p className="text-sm text-slate-400 mb-4">
            Issue chips from the bank for this session.
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
              onClick={handleCashOut}
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Cash Out'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
