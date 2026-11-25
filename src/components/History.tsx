import { RESOURCE_KEYS, RESOURCE_LABELS } from '../gameLogic'
import type { Game, HistoryEntry } from '../types'

interface Props {
  game: Game
}

function GenerationDetails({ entry }: { entry: HistoryEntry }) {
  const { before, after } = entry
  return (
    <details className="history-entry">
      <summary>
        <span className="history-gen">Generation {entry.generation}</span>
        <span className="history-gist">
          M€ {before.stock.megacredits} to {after.stock.megacredits}
        </span>
      </summary>

      <table className="history-table">
        <thead>
          <tr>
            <th scope="col">Resource</th>
            <th scope="col">End of generation</th>
            <th scope="col">Production</th>
            <th scope="col">After production</th>
          </tr>
        </thead>
        <tbody>
          {RESOURCE_KEYS.map((key) => (
            <tr key={key} style={{ ['--tone' as string]: `var(--${key})` }}>
              <th scope="row">
                <span className="dot" aria-hidden="true" />
                {RESOURCE_LABELS[key]}
              </th>
              <td>{before.stock[key]}</td>
              <td>{before.production[key]}</td>
              <td>{after.stock[key]}</td>
            </tr>
          ))}
          <tr className="history-tr">
            <th scope="row">Terraform rating</th>
            <td colSpan={3}>{before.terraformRating}</td>
          </tr>
        </tbody>
      </table>
      <p className="hint">
        Energy you held at the end of the generation became heat before the
        other resources were added.
      </p>
    </details>
  )
}

export function History({ game }: Props) {
  if (game.history.length === 0) {
    return (
      <div className="empty">
        <h2>No generations saved yet</h2>
        <p>
          When you run the production phase, the numbers from that generation
          are saved here so you can check them later.
        </p>
      </div>
    )
  }

  return (
    <div className="history">
      {[...game.history].reverse().map((entry) => (
        <GenerationDetails key={entry.generation} entry={entry} />
      ))}
    </div>
  )
}
