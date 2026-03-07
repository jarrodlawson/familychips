export interface Player {
  id: string;
  name: string;
  chips: number;
  revived_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  player_id: string;
  amount: number; // positive = gained, negative = lost
  note: string | null;
  type: TransactionType;
  created_at: string;
  player?: Player;
}

export type TransactionType =
  | 'initial'
  | 'adjustment'
  | 'revival'
  | 'wager_win'
  | 'wager_loss'
  | 'barter';

export interface FunStats {
  luckyOne: { player: Player; netGain: number } | null;
  addict: { player: Player; count: number } | null;
  miser: { player: Player; count: number } | null;
  mostBroke: { player: Player; revivedCount: number } | null;
  bigSpender: { player: Player; biggestLoss: number } | null;
  comebackKid: { player: Player } | null;
}

export interface PlayerWithStats extends Player {
  transactionCount: number;
  netGain: number;
  biggestLoss: number;
}
