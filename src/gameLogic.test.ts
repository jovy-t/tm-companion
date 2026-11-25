import { describe, expect, it } from 'vitest'
import {
  applyProduction,
  createGame,
  emptyAmounts,
  modeDefaults,
  runProductionPhase,
} from './gameLogic'
import { reducer } from './store'
import type { Snapshot } from './types'

const board = (overrides: Partial<Snapshot> = {}): Snapshot => ({
  terraformRating: 20,
  stock: emptyAmounts(0),
  production: emptyAmounts(1),
  ...overrides,
})

describe('mode defaults', () => {
  it('solo starts at TR 14 with no production', () => {
    const solo = modeDefaults('solo')
    expect(solo.terraformRating).toBe(14)
    expect(Object.values(solo.production).every((n) => n === 0)).toBe(true)
  })

  it('multiplayer starts at TR 20 with 1 production of each resource', () => {
    const multi = modeDefaults('multiplayer')
    expect(multi.terraformRating).toBe(20)
    expect(Object.values(multi.production).every((n) => n === 1)).toBe(true)
  })
})

describe('production phase', () => {
  it('turns energy into heat before adding production', () => {
    const result = applyProduction(
      board({ stock: { ...emptyAmounts(0), energy: 4, heat: 2 } }),
    )
    // heat: 2 + 4 (from energy) + 1 production = 7. Energy restarts at its production.
    expect(result.stock.heat).toBe(7)
    expect(result.stock.energy).toBe(1)
  })

  it('adds TR plus M€ production to M€', () => {
    const result = applyProduction(
      board({
        terraformRating: 23,
        stock: { ...emptyAmounts(0), megacredits: 10 },
        production: { ...emptyAmounts(0), megacredits: -2 },
      }),
    )
    expect(result.stock.megacredits).toBe(10 + 23 - 2)
  })

  it('adds production to the other resources', () => {
    const result = applyProduction(
      board({
        stock: { ...emptyAmounts(0), steel: 3, titanium: 1, plants: 5 },
        production: { ...emptyAmounts(0), steel: 2, titanium: 1, plants: 4 },
      }),
    )
    expect(result.stock.steel).toBe(5)
    expect(result.stock.titanium).toBe(2)
    expect(result.stock.plants).toBe(9)
  })

  it('does not change the board it was given', () => {
    const original = board({ stock: { ...emptyAmounts(0), energy: 3 } })
    applyProduction(original)
    expect(original.stock.energy).toBe(3)
  })
})

describe('generations and history', () => {
  it('advances the generation and saves a history entry', () => {
    const game = createGame('multiplayer', board())
    const next = runProductionPhase(game)
    expect(next.generation).toBe(2)
    expect(next.history).toHaveLength(1)
    expect(next.history[0].generation).toBe(1)
    expect(next.history[0].before.stock.megacredits).toBe(0)
    expect(next.history[0].after.stock.megacredits).toBe(21)
  })

  it('ends a solo game after generation 14 without advancing', () => {
    let game = createGame('solo', board({ terraformRating: 14 }))
    for (let i = 0; i < 14; i++) game = runProductionPhase(game)
    expect(game.generation).toBe(14)
    expect(game.ended).toBe(true)
    expect(game.history).toHaveLength(14)

    const again = runProductionPhase(game)
    expect(again).toBe(game)
  })

  it('keeps going past 14 in multiplayer', () => {
    let game = createGame('multiplayer', board())
    for (let i = 0; i < 15; i++) game = runProductionPhase(game)
    expect(game.generation).toBe(16)
    expect(game.ended).toBe(false)
  })
})

describe('board edits and undo', () => {
  const start = () =>
    reducer(
      { game: null, past: [], future: [] },
      { type: 'start', game: createGame('solo', board({ terraformRating: 14 })) },
    )

  it('never lets stockpiles go below zero', () => {
    const state = reducer(start(), {
      type: 'adjustStock',
      key: 'steel',
      delta: -5,
    })
    expect(state.game?.board.stock.steel).toBe(0)
  })

  it('lets M€ production fall to -5 but no lower', () => {
    let state = start()
    for (let i = 0; i < 8; i++) {
      state = reducer(state, {
        type: 'adjustProduction',
        key: 'megacredits',
        delta: -1,
      })
    }
    expect(state.game?.board.production.megacredits).toBe(-5)
  })

  it('keeps other production at zero or above', () => {
    const state = reducer(start(), {
      type: 'adjustProduction',
      key: 'plants',
      delta: -1,
    })
    expect(state.game?.board.production.plants).toBe(0)
  })

  it('undoes and redoes a production phase', () => {
    let state = start()
    state = reducer(state, { type: 'runProduction' })
    expect(state.game?.generation).toBe(2)

    state = reducer(state, { type: 'undo' })
    expect(state.game?.generation).toBe(1)
    expect(state.game?.history).toHaveLength(0)

    state = reducer(state, { type: 'redo' })
    expect(state.game?.generation).toBe(2)
  })
})
