import type { Amounts, Game, GameMode, ResourceKey, Snapshot } from './types'

export const RESOURCE_KEYS: ResourceKey[] = [
  'megacredits',
  'steel',
  'titanium',
  'plants',
  'energy',
  'heat',
]

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  megacredits: 'M€',
  steel: 'Steel',
  titanium: 'Titanium',
  plants: 'Plants',
  energy: 'Energy',
  heat: 'Heat',
}

export const SOLO_LAST_GENERATION = 14
export const MIN_MEGACREDIT_PRODUCTION = -5

export function emptyAmounts(value = 0): Amounts {
  return {
    megacredits: value,
    steel: value,
    titanium: value,
    plants: value,
    energy: value,
    heat: value,
  }
}

/** Starting terraform rating and production differ between solo and multiplayer. */
export function modeDefaults(mode: GameMode): {
  terraformRating: number
  production: Amounts
} {
  return mode === 'solo'
    ? { terraformRating: 14, production: emptyAmounts(0) }
    : { terraformRating: 20, production: emptyAmounts(1) }
}

export function minProduction(key: ResourceKey): number {
  return key === 'megacredits' ? MIN_MEGACREDIT_PRODUCTION : 0
}

export function minStock(): number {
  return 0
}

export function createGame(mode: GameMode, board: Snapshot): Game {
  return { mode, generation: 1, ended: false, board, history: [] }
}

export function isFinalGeneration(game: Game): boolean {
  return game.mode === 'solo' && game.generation >= SOLO_LAST_GENERATION
}

/**
 * The production phase, in rulebook order:
 * 1. All energy becomes heat.
 * 2. M€ rises by your TR plus your M€ production (which can be negative).
 * 3. Every other resource rises by its production.
 */
export function applyProduction(board: Snapshot): Snapshot {
  const stock: Amounts = { ...board.stock }

  stock.heat += stock.energy
  stock.energy = 0

  stock.megacredits += board.terraformRating + board.production.megacredits
  stock.steel += board.production.steel
  stock.titanium += board.production.titanium
  stock.plants += board.production.plants
  stock.energy += board.production.energy
  stock.heat += board.production.heat

  return {
    terraformRating: board.terraformRating,
    stock,
    production: { ...board.production },
  }
}

export function runProductionPhase(game: Game): Game {
  if (game.ended) return game

  const after = applyProduction(game.board)
  const entry = {
    generation: game.generation,
    before: game.board,
    after,
  }
  const final = isFinalGeneration(game)

  return {
    ...game,
    generation: final ? game.generation : game.generation + 1,
    ended: final,
    board: after,
    history: [...game.history, entry],
  }
}
