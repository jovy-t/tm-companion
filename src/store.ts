import { useEffect, useReducer } from 'react'
import {
  minProduction,
  minStock,
  runProductionPhase,
} from './gameLogic'
import type { Game, ResourceKey } from './types'

const STORAGE_KEY = 'tm-companion:game:v1'
const MAX_UNDO_STEPS = 100

export interface State {
  game: Game | null
  past: Game[]
  future: Game[]
}

export type Action =
  | { type: 'start'; game: Game }
  | { type: 'adjustStock'; key: ResourceKey; delta: number }
  | { type: 'setStock'; key: ResourceKey; value: number }
  | { type: 'adjustProduction'; key: ResourceKey; delta: number }
  | { type: 'adjustTR'; delta: number }
  | { type: 'setTR'; value: number }
  | { type: 'runProduction' }
  | { type: 'newGame' }
  | { type: 'undo' }
  | { type: 'redo' }

const clamp = (value: number, min: number) => Math.max(min, Math.round(value))

/** Records the current game on the undo stack and moves to the next one. */
function commit(state: State, next: Game): State {
  if (!state.game || next === state.game) return state
  return {
    game: next,
    past: [...state.past, state.game].slice(-MAX_UNDO_STEPS),
    future: [],
  }
}

export function reducer(state: State, action: Action): State {
  const game = state.game

  switch (action.type) {
    case 'start':
      return { game: action.game, past: [], future: [] }

    case 'newGame':
      return { game: null, past: [], future: [] }

    case 'undo': {
      if (!game || state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        game: previous,
        past: state.past.slice(0, -1),
        future: [game, ...state.future],
      }
    }

    case 'redo': {
      if (!game || state.future.length === 0) return state
      const [next, ...rest] = state.future
      return { game: next, past: [...state.past, game], future: rest }
    }
  }

  if (!game) return state

  switch (action.type) {
    case 'adjustStock': {
      const value = clamp(game.board.stock[action.key] + action.delta, minStock())
      return commit(state, {
        ...game,
        board: {
          ...game.board,
          stock: { ...game.board.stock, [action.key]: value },
        },
      })
    }

    case 'setStock': {
      const value = clamp(action.value, minStock())
      if (value === game.board.stock[action.key]) return state
      return commit(state, {
        ...game,
        board: {
          ...game.board,
          stock: { ...game.board.stock, [action.key]: value },
        },
      })
    }

    case 'adjustProduction': {
      const value = clamp(
        game.board.production[action.key] + action.delta,
        minProduction(action.key),
      )
      return commit(state, {
        ...game,
        board: {
          ...game.board,
          production: { ...game.board.production, [action.key]: value },
        },
      })
    }

    case 'adjustTR':
      return commit(state, {
        ...game,
        board: {
          ...game.board,
          terraformRating: clamp(game.board.terraformRating + action.delta, 0),
        },
      })

    case 'setTR': {
      const value = clamp(action.value, 0)
      if (value === game.board.terraformRating) return state
      return commit(state, {
        ...game,
        board: { ...game.board, terraformRating: value },
      })
    }

    case 'runProduction':
      return commit(state, runProductionPhase(game))

    default:
      return state
  }
}

function isGame(value: unknown): value is Game {
  if (typeof value !== 'object' || value === null) return false
  const g = value as Partial<Game>
  return (
    (g.mode === 'solo' || g.mode === 'multiplayer') &&
    typeof g.generation === 'number' &&
    typeof g.ended === 'boolean' &&
    typeof g.board === 'object' &&
    g.board !== null &&
    Array.isArray(g.history)
  )
}

function loadGame(): Game | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isGame(parsed) ? parsed : null
  } catch {
    return null
  }
}

function saveGame(game: Game | null) {
  try {
    if (game) localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be unavailable (private browsing). The app still works for this session.
  }
}

export function useGameStore() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    game: loadGame(),
    past: [],
    future: [],
  }))

  useEffect(() => {
    saveGame(state.game)
  }, [state.game])

  return { state, dispatch }
}
