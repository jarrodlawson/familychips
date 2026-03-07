import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPlayer, getTransactions } from '@/lib/db';
import AdjustPanel from './AdjustPanel';

export const revalidate = 0;

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [player, transactions] = await Promise.all([
    getPlayer(id),
    getTransactions(id),
  ]);

  if (!player) notFound();

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-xl mx-auto">
      <Link href="/admin/dashboard" className="text-slate-400 text-sm hover:text-slate-200 block mb-4">
        ← Dashboard
      </Link>

      <div className="bg-[#1e293b] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold">{player.name}</h1>
          <span className="text-3xl font-bold text-amber-400">{player.chips} 🪙</span>
        </div>
        {player.revived_count > 0 && (
          <p className="text-sm text-slate-400">Revived {player.revived_count} time{player.revived_count > 1 ? 's' : ''}</p>
        )}
      </div>

      <AdjustPanel player={player} />

      {transactions.length > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-bold text-slate-300 mb-2">Transaction History</h2>
          <div className="bg-[#1e293b] rounded-xl divide-y divide-slate-700">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm capitalize text-slate-300">{tx.type.replace('_', ' ')}</span>
                  {tx.note && <span className="text-xs text-slate-500 ml-2">{tx.note}</span>}
                  <div className="text-xs text-slate-600">
                    {new Date(tx.created_at).toLocaleString()}
                  </div>
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
