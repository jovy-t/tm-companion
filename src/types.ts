export type ResourceKey =
  | 'megacredits'
  | 'steel'
  | 'titanium'
  | 'plants'
  | 'energy'
  | 'heat'

export type Amounts = Record<ResourceKey, number>

export type GameMode = 'solo' | 'multiplayer'

/** Everything about one player's board at a single moment. */
export interface Snapshot {
  terraformRating: number
  stock: Amounts
  production: Amounts
}

/** What the board looked like when a generation ended, and right after production ran. */
export interface HistoryEntry {
  generation: number
  before: Snapshot
  after: Snapshot
}

export interface Game {
  mode: GameMode
  generation: number
  /** True once the final production phase of a solo game has run. */
  ended: boolean
  board: Snapshot
  history: HistoryEntry[]
}
