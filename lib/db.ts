import { createServerClient } from './supabase';
import type { Player, Transaction, PlayerWithStats, FunStats } from './types';

export async function getPlayers(): Promise<Player[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('is_active', true)
    .order('chips', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPlayer(id: string): Promise<Player | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function createPlayer(name: string): Promise<Player> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('players')
    .insert({ name, chips: 10 })
    .select()
    .single();
  if (error) throw error;

  // Log the initial chip grant
  await supabase.from('transactions').insert({
    player_id: data.id,
    amount: 10,
    type: 'initial',
    note: 'Starting chips',
  });

  return data;
}

export async function cashOut(playerId: string, amount: number): Promise<Player> {
  const supabase = createServerClient();

  const player = await getPlayer(playerId);
  if (!player) throw new Error('Player not found');
  if (player.is_playing) throw new Error('Player is already in a game');
  if (amount > player.chips) throw new Error('Not enough chips in bank');

  const { data, error } = await supabase
    .from('players')
    .update({ chips: player.chips - amount, is_playing: true })
    .eq('id', playerId)
    .select()
    .single();
  if (error) throw error;

  await supabase.from('transactions').insert({
    player_id: playerId,
    amount: -amount,
    type: 'cash_out',
    note: null,
  });

  return data;
}

export async function cashIn(playerId: string, chipsReturned: number): Promise<Player> {
  const supabase = createServerClient();

  const player = await getPlayer(playerId);
  if (!player) throw new Error('Player not found');
  if (!player.is_playing) throw new Error('Player is not currently in a game');

  const { data, error } = await supabase
    .from('players')
    .update({ chips: player.chips + chipsReturned, is_playing: false })
    .eq('id', playerId)
    .select()
    .single();
  if (error) throw error;

  await supabase.from('transactions').insert({
    player_id: playerId,
    amount: chipsReturned,
    type: 'cash_in',
    note: chipsReturned === 0 ? 'Bust — walked away with nothing' : null,
  });

  return data;
}

export async function revivePlayer(
  playerId: string,
  chips: number
): Promise<Player> {
  const supabase = createServerClient();

  // First fetch current revived_count
  const current = await getPlayer(playerId);
  if (!current) throw new Error('Player not found');

  const { data, error } = await supabase
    .from('players')
    .update({ chips, revived_count: current.revived_count + 1 })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;

  await supabase.from('transactions').insert({
    player_id: playerId,
    amount: chips,
    type: 'revival',
    note: 'Chore completed — back in the game!',
  });

  return data;
}

export async function deactivatePlayer(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('players')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}

export async function getTransactions(playerId?: string): Promise<Transaction[]> {
  const supabase = createServerClient();
  let query = supabase
    .from('transactions')
    .select('*, player:players(id, name)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (playerId) {
    query = query.eq('player_id', playerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPlayersWithStats(): Promise<PlayerWithStats[]> {
  const supabase = createServerClient();

  const [playersResult, txResult] = await Promise.all([
    supabase.from('players').select('*').eq('is_active', true).order('chips', { ascending: false }),
    supabase.from('transactions').select('*'),
  ]);

  if (playersResult.error) throw playersResult.error;

  const players: Player[] = playersResult.data ?? [];
  const transactions: Transaction[] = txResult.data ?? [];

  return players.map((p) => {
    const playerTx = transactions.filter((t) => t.player_id === p.id);
    const netGain = playerTx.reduce((sum, t) => sum + t.amount, 0) - 10; // subtract starting 10
    const biggestLoss = playerTx
      .filter((t) => t.amount < 0)
      .reduce((min, t) => Math.min(min, t.amount), 0);

    const cashOuts = playerTx.filter((t) => t.type === 'cash_out');
    const cashIns = playerTx.filter((t) => t.type === 'cash_in');
    const sessionCount = cashOuts.length;
    const biggestStake = cashOuts.length > 0
      ? Math.max(...cashOuts.map((t) => Math.abs(t.amount)))
      : 0;
    const totalOut = cashOuts.reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalIn = cashIns.reduce((s, t) => s + t.amount, 0);
    const returnsRatio = totalOut > 0 ? totalIn / totalOut : 0;

    return {
      ...p,
      transactionCount: playerTx.length,
      netGain,
      biggestLoss,
      sessionCount,
      biggestStake,
      returnsRatio,
    };
  });
}

export function computeFunStats(players: PlayerWithStats[]): FunStats {
  if (players.length === 0) {
    return {
      luckyOne: null,
      addict: null,
      miser: null,
      mostBroke: null,
      bigSpender: null,
      comebackKid: null,
      mostSessions: null,
      highRoller: null,
      bestReturns: null,
      currentlyPlaying: 0,
    };
  }

  const sorted = {
    byNetGain: [...players].sort((a, b) => b.netGain - a.netGain),
    byTxCount: [...players].sort((a, b) => b.transactionCount - a.transactionCount),
    byRevived: [...players].sort((a, b) => b.revived_count - a.revived_count),
    byLoss: [...players].sort((a, b) => a.biggestLoss - b.biggestLoss),
  };

  const luckyOne = sorted.byNetGain[0];
  const addict = sorted.byTxCount[0];
  const miser = sorted.byTxCount[sorted.byTxCount.length - 1];
  const mostBroke = sorted.byRevived[0];
  const bigSpender = sorted.byLoss[0];

  // Comeback kid: was revived at least once AND has the most chips among revived players
  const revivedPlayers = players.filter((p) => p.revived_count > 0);
  const comebackKid = revivedPlayers.length > 0
    ? revivedPlayers.reduce((best, p) => (p.chips > best.chips ? p : best))
    : null;

  const currentlyPlaying = players.filter((p) => p.is_playing).length;

  const bySessionCount = [...players].sort((a, b) => b.sessionCount - a.sessionCount);
  const topSessions = bySessionCount[0];
  const mostSessions = topSessions && topSessions.sessionCount > 0
    ? { player: topSessions, sessionCount: topSessions.sessionCount }
    : null;

  const byStake = [...players].sort((a, b) => b.biggestStake - a.biggestStake);
  const topStake = byStake[0];
  const highRoller = topStake && topStake.biggestStake > 0
    ? { player: topStake, biggestStake: topStake.biggestStake }
    : null;

  const qualified = players.filter((p) => p.sessionCount > 0);
  const byReturns = [...qualified].sort((a, b) => b.returnsRatio - a.returnsRatio);
  const bestReturns = byReturns[0]
    ? { player: byReturns[0], ratio: byReturns[0].returnsRatio }
    : null;

  return {
    luckyOne: luckyOne ? { player: luckyOne, netGain: luckyOne.netGain } : null,
    addict: addict ? { player: addict, count: addict.transactionCount } : null,
    miser: miser ? { player: miser, count: miser.transactionCount } : null,
    mostBroke: mostBroke && mostBroke.revived_count > 0
      ? { player: mostBroke, revivedCount: mostBroke.revived_count }
      : null,
    bigSpender: bigSpender && bigSpender.biggestLoss < 0
      ? { player: bigSpender, biggestLoss: Math.abs(bigSpender.biggestLoss) }
      : null,
    comebackKid: comebackKid ? { player: comebackKid } : null,
    mostSessions,
    highRoller,
    bestReturns,
    currentlyPlaying,
  };
}
