import type { FunStats } from '@/lib/types';

interface Props {
  stats: FunStats;
}

interface StatCardProps {
  emoji: string;
  title: string;
  name: string;
  detail: string;
}

function StatCard({ emoji, title, name, detail }: StatCardProps) {
  return (
    <div className="bg-[#1e293b] rounded-xl p-4 flex flex-col gap-1">
      <div className="text-2xl">{emoji}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</div>
      <div className="font-bold text-lg">{name}</div>
      <div className="text-sm text-slate-400">{detail}</div>
    </div>
  );
}

export default function StatsPanel({ stats }: Props) {
  const cards: StatCardProps[] = [];

  if (stats.luckyOne) {
    cards.push({
      emoji: '🍀',
      title: 'The Lucky One',
      name: stats.luckyOne.player.name,
      detail: stats.luckyOne.netGain >= 0
        ? `Up ${stats.luckyOne.netGain} chips overall`
        : `Down ${Math.abs(stats.luckyOne.netGain)} chips overall`,
    });
  }

  if (stats.addict) {
    cards.push({
      emoji: '🎰',
      title: 'The Addict',
      name: stats.addict.player.name,
      detail: `${stats.addict.count} transactions and counting`,
    });
  }

  if (stats.miser) {
    cards.push({
      emoji: '🏦',
      title: 'The Miser',
      name: stats.miser.player.name,
      detail: `Only ${stats.miser.count} transactions — plays it safe`,
    });
  }

  if (stats.mostBroke) {
    cards.push({
      emoji: '💸',
      title: 'Most Broke',
      name: stats.mostBroke.player.name,
      detail: `Gone bust ${stats.mostBroke.revivedCount} time${stats.mostBroke.revivedCount > 1 ? 's' : ''}`,
    });
  }

  if (stats.bigSpender) {
    cards.push({
      emoji: '🤑',
      title: 'Big Spender',
      name: stats.bigSpender.player.name,
      detail: `Lost ${stats.bigSpender.biggestLoss} chips in one go`,
    });
  }

  if (stats.comebackKid) {
    cards.push({
      emoji: '🔥',
      title: 'Comeback Kid',
      name: stats.comebackKid.player.name,
      detail: `Revived and back with ${stats.comebackKid.player.chips} chips`,
    });
  }

  if (cards.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 text-slate-300">Fun Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
