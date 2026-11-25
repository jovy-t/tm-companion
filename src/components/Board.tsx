import { useEffect, useRef, useState } from 'react'
import {
  RESOURCE_KEYS,
  SOLO_LAST_GENERATION,
  applyProduction,
  isFinalGeneration,
} from '../gameLogic'
import type { Action } from '../store'
import type { Game } from '../types'
import { NumberField } from './NumberField'
import { ResourceTile } from './ResourceTile'

interface Props {
  game: Game
  dispatch: (action: Action) => void
}

export function Board({ game, dispatch }: Props) {
  const { board } = game
  const next = applyProduction(board)
  const finalGeneration = isFinalGeneration(game)

  // Feedback after the production button is pressed.
  const [endedGeneration, setEndedGeneration] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  const runProduction = () => {
    dispatch({ type: 'runProduction' })
    setEndedGeneration(game.generation)
    setLocked(true)
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = [
      // Brief lock so a double-tap can't run production twice.
      window.setTimeout(() => setLocked(false), 1200),
      window.setTimeout(() => setEndedGeneration(null), 6000),
    ]
  }

  const undoProduction = () => {
    dispatch({ type: 'undo' })
    setEndedGeneration(null)
    setLocked(false)
  }

  const justRan = endedGeneration !== null

  return (
    <>
      <section className="tr-bar" aria-label="Terraform rating">
        <h2>Terraform rating</h2>
        <div className="tr-controls">
          <button
            className="prod-btn minus"
            aria-label="Lower terraform rating"
            onClick={() => dispatch({ type: 'adjustTR', delta: -1 })}
          >
            −
          </button>
          <NumberField
            className="tr-value"
            label="Terraform rating"
            value={board.terraformRating}
            onCommit={(value) => dispatch({ type: 'setTR', value })}
          />
          <button
            className="prod-btn plus"
            aria-label="Raise terraform rating"
            onClick={() => dispatch({ type: 'adjustTR', delta: 1 })}
          >
            +
          </button>
        </div>
      </section>

      <div className="board">
        {RESOURCE_KEYS.map((key) => (
          <ResourceTile
            key={key}
            resource={key}
            stock={board.stock[key]}
            production={board.production[key]}
            afterProduction={next.stock[key]}
            flash={justRan}
            dispatch={dispatch}
          />
        ))}
      </div>

      <details className="reminders">
        <summary>Reminders</summary>
        <ul>
          <li>Your M€ income is your terraform rating plus your M€ production.</li>
          <li>Energy left over turns into heat when production runs.</li>
          <li>Spend 8 heat to raise the temperature one step.</li>
          <li>Spend 8 plants to place a greenery tile.</li>
        </ul>
      </details>

      <div className="production-bar">
        {justRan && (
          <p className="confirmation" role="status">
            <span>
              {game.ended
                ? `Final production done. Generation ${endedGeneration} is over.`
                : `Generation ${endedGeneration} is over. Production was added to your board.`}
            </span>
            <button className="link-button" onClick={undoProduction}>
              Undo
            </button>
          </p>
        )}

        {game.ended && !justRan ? (
          <p className="ended">
            Generation {SOLO_LAST_GENERATION} is done. Convert any plants to
            greenery, then count your VPs.
          </p>
        ) : (
          <button
            className={locked ? 'primary wide done' : 'primary wide'}
            disabled={locked || game.ended}
            onClick={runProduction}
          >
            {locked ? (
              <span className="primary-main">Production run</span>
            ) : (
              <>
                <span className="primary-main">
                  {finalGeneration
                    ? 'Run the final production phase'
                    : 'Run production phase'}
                </span>
                <span className="primary-sub">
                  Ends generation {game.generation}
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </>
  )
}
