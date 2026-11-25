import { useState } from 'react'
import { Board } from './components/Board'
import { History } from './components/History'
import { Setup } from './components/Setup'
import { SOLO_LAST_GENERATION } from './gameLogic'
import { useGameStore } from './store'

type Tab = 'board' | 'history'

export default function App() {
  const { state, dispatch } = useGameStore()
  const [tab, setTab] = useState<Tab>('board')
  const { game } = state

  if (!game) {
    return <Setup onStart={(next) => dispatch({ type: 'start', game: next })} />
  }

  const generationLabel =
    game.mode === 'solo'
      ? `Generation ${game.generation} of ${SOLO_LAST_GENERATION}`
      : `Generation ${game.generation}`

  const startNewGame = () => {
    if (window.confirm('Start a new game? This clears your current game.')) {
      dispatch({ type: 'newGame' })
      setTab('board')
    }
  }

  return (
    <div className="page">
      <header className="top">
        <div>
          <h1 className="generation">{generationLabel}</h1>
          <p className="mode-label">
            {game.mode === 'solo' ? 'Solo game' : 'Multiplayer game'}
          </p>
        </div>
        <div className="top-actions">
          <button
            className="quiet"
            onClick={() => dispatch({ type: 'undo' })}
            disabled={state.past.length === 0}
          >
            Undo
          </button>
          <button
            className="quiet"
            onClick={() => dispatch({ type: 'redo' })}
            disabled={state.future.length === 0}
          >
            Redo
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Views">
        <button
          className={tab === 'board' ? 'tab current' : 'tab'}
          aria-current={tab === 'board' ? 'page' : undefined}
          onClick={() => setTab('board')}
        >
          My board
        </button>
        <button
          className={tab === 'history' ? 'tab current' : 'tab'}
          aria-current={tab === 'history' ? 'page' : undefined}
          onClick={() => setTab('history')}
        >
          Past generations
          {game.history.length > 0 && (
            <span className="count">{game.history.length}</span>
          )}
        </button>
      </nav>

      <main>
        {tab === 'board' ? (
          <Board game={game} dispatch={dispatch} />
        ) : (
          <History game={game} />
        )}
      </main>

      <footer className="foot">
        <button className="quiet" onClick={startNewGame}>
          New game
        </button>
      </footer>
    </div>
  )
}
