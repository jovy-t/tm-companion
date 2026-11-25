import { useState } from 'react'
import {
  RESOURCE_KEYS,
  RESOURCE_LABELS,
  SOLO_LAST_GENERATION,
  createGame,
  emptyAmounts,
  minProduction,
  modeDefaults,
} from '../gameLogic'
import type { Game, GameMode, ResourceKey } from '../types'
import { NumberField } from './NumberField'

interface Props {
  onStart: (game: Game) => void
}

export function Setup({ onStart }: Props) {
  const [mode, setMode] = useState<GameMode>('solo')
  const [terraformRating, setTerraformRating] = useState(
    modeDefaults('solo').terraformRating,
  )
  const [production, setProduction] = useState(modeDefaults('solo').production)
  const [stock, setStock] = useState(emptyAmounts(0))

  const chooseMode = (next: GameMode) => {
    setMode(next)
    const defaults = modeDefaults(next)
    setTerraformRating(defaults.terraformRating)
    setProduction(defaults.production)
  }

  const setStockFor = (key: ResourceKey, value: number) =>
    setStock((current) => ({ ...current, [key]: Math.max(0, value) }))

  const setProductionFor = (key: ResourceKey, value: number) =>
    setProduction((current) => ({
      ...current,
      [key]: Math.max(minProduction(key), value),
    }))

  return (
    <main className="page setup">
      <h1>Set up your game</h1>
      <p className="lede">
        Pick how you're playing. The starting numbers fill in for you, and you
        can change any of them.
      </p>

      <fieldset className="modes">
        <legend>Game type</legend>
        <label className={mode === 'solo' ? 'mode chosen' : 'mode'}>
          <input
            type="radio"
            name="mode"
            checked={mode === 'solo'}
            onChange={() => chooseMode('solo')}
          />
          <span className="mode-name">Solo</span>
          <span className="mode-detail">
            {SOLO_LAST_GENERATION} generations. Terraform rating starts at 14 and
            you start with no production.
          </span>
        </label>
        <label className={mode === 'multiplayer' ? 'mode chosen' : 'mode'}>
          <input
            type="radio"
            name="mode"
            checked={mode === 'multiplayer'}
            onChange={() => chooseMode('multiplayer')}
          />
          <span className="mode-name">Multiplayer</span>
          <span className="mode-detail">
            Terraform rating starts at 20 and you start with 1 production of
            each resource. This tracks your own board for now.
          </span>
        </label>
      </fieldset>

      <section className="start-values">
        <h2>Starting numbers</h2>
        <p className="hint">
          Your corporation card sets your starting M€ and any extra resources
          or production. Enter those here.
        </p>

        <div className="tr-row">
          <span className="tr-row-label">Terraform rating</span>
          <NumberField
            className="field"
            label="Starting terraform rating"
            value={terraformRating}
            onCommit={(value) => setTerraformRating(Math.max(0, value))}
          />
        </div>

        <table className="start-table">
          <thead>
            <tr>
              <th scope="col">Resource</th>
              <th scope="col">Stockpile</th>
              <th scope="col">Production</th>
            </tr>
          </thead>
          <tbody>
            {RESOURCE_KEYS.map((key) => (
              <tr key={key} style={{ ['--tone' as string]: `var(--${key})` }}>
                <th scope="row">
                  <span className="dot" aria-hidden="true" />
                  {RESOURCE_LABELS[key]}
                </th>
                <td>
                  <NumberField
                    className="field"
                    label={`Starting ${RESOURCE_LABELS[key]} stockpile`}
                    value={stock[key]}
                    onCommit={(value) => setStockFor(key, value)}
                  />
                </td>
                <td>
                  <NumberField
                    className="field"
                    label={`Starting ${RESOURCE_LABELS[key]} production`}
                    value={production[key]}
                    onCommit={(value) => setProductionFor(key, value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button
        className="primary wide"
        onClick={() =>
          onStart(createGame(mode, { terraformRating, stock, production }))
        }
      >
        Start game
      </button>

      <p className="footnote">
        An unofficial fan tool. Terraforming Mars is a product of FryxGames.
      </p>
    </main>
  )
}
