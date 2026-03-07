'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPlayerPage() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1e293b] rounded-2xl p-8 shadow-xl">
        <Link href="/admin/dashboard" className="text-slate-400 text-sm hover:text-slate-200 block mb-4">
          ← Back
        </Link>
        <h1 className="text-xl font-bold mb-6">Add Player</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              placeholder="e.g. Grandma Pat"
              autoFocus
              required
            />
          </div>
          <p className="text-sm text-slate-400">They'll start with 10 chips 🪙</p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Player'}
          </button>
        </form>
      </div>
    </main>
  );
}
