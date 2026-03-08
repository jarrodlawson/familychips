export interface Player {
  id: string;
  name: string;
  chips: number;
  revived_count: number;
  is_active: boolean;
  is_playing: boolean;
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
  | 'revival'
  | 'cash_out'
  | 'cash_in';

export interface FunStats {
  luckyOne: { player: Player; netGain: number } | null;
  addict: { player: Player; count: number } | null;
  miser: { player: Player; count: number } | null;
  mostBroke: { player: Player; revivedCount: number } | null;
  bigSpender: { player: Player; biggestLoss: number } | null;
  comebackKid: { player: Player } | null;
  mostSessions: { player: Player; sessionCount: number } | null;
  highRoller: { player: Player; biggestStake: number } | null;
  bestReturns: { player: Player; ratio: number } | null;
  currentlyPlaying: number;
}

export interface PlayerWithStats extends Player {
  transactionCount: number;
  netGain: number;
  biggestLoss: number;
  sessionCount: number;
  biggestStake: number;
  returnsRatio: number;
}
