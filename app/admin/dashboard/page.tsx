import Link from 'next/link';
import { getPlayers, getTransactions } from '@/lib/db';
import LogoutButton from './LogoutButton';
import PlayerCard from './PlayerCard';

export const revalidate = 0;

export default async function DashboardPage() {
  const [players, recentTx] = await Promise.all([
    getPlayers(),
    getTransactions(),
  ]);

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">Admin Dashboard</h1>
          <Link href="/" className="text-slate-400 text-sm hover:text-slate-300">
            ← Public view
          </Link>
        </div>
        <LogoutButton />
      </header>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-300">
          Players ({players.length})
        </h2>
        <Link
          href="/admin/players/new"
          className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add Player
        </Link>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No players yet. Add some!
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}

      {recentTx.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-300 mb-3">Recent Activity</h2>
          <div className="bg-[#1e293b] rounded-xl divide-y divide-slate-700">
            {recentTx.slice(0, 20).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-medium">
                    {(tx.player as { name?: string })?.name ?? 'Unknown'}
                  </span>
                  {tx.note && (
                    <span className="text-xs text-slate-400 ml-2">{tx.note}</span>
                  )}
                </div>
                <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} 🪙
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
