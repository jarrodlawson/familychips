import { getPlayersWithStats, computeFunStats } from '@/lib/db';
import Leaderboard from './components/Leaderboard';
import StatsPanel from './components/StatsPanel';

export const revalidate = 0;

export default async function HomePage() {
  const players = await getPlayersWithStats();
  const stats = computeFunStats(players);

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-400 mb-1">🪙 Family Chips</h1>
        <p className="text-slate-400 text-sm">Live leaderboard · updates automatically</p>
      </header>

      {players.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          <p className="text-5xl mb-4">🎲</p>
          <p>No players yet. Ask admin to add everyone!</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold mb-3 text-slate-300">Leaderboard</h2>
            <Leaderboard initialPlayers={players} />
          </section>

          <StatsPanel stats={stats} />
        </div>
      )}

      <footer className="text-center mt-12 text-xs text-slate-600">
        Zero chips? Go do a chore and get revived!
      </footer>
    </main>
  );
}
