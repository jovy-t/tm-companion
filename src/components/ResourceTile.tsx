import { RESOURCE_ICONS } from '../icons'
import { RESOURCE_LABELS, minProduction } from '../gameLogic'
import type { Action } from '../store'
import type { ResourceKey } from '../types'
import { NumberField } from './NumberField'

interface Props {
  resource: ResourceKey
  stock: number
  production: number
  afterProduction: number
  flash: boolean
  dispatch: (action: Action) => void
}

const SMALL_STEPS = [-1, 1, -5, 5]
const MONEY_STEPS = [-1, 1, -5, 5, -10, 10]

const signed = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`)

export function ResourceTile({
  resource,
  stock,
  production,
  afterProduction,
  flash,
  dispatch,
}: Props) {
  const name = RESOURCE_LABELS[resource]
  const steps = resource === 'megacredits' ? MONEY_STEPS : SMALL_STEPS
  const icon = RESOURCE_ICONS[resource]

  return (
    <section
      className={flash ? 'tile flash' : 'tile'}
      style={{ ['--tone' as string]: `var(--${resource})` }}
      aria-label={name}
    >
      <header className="tile-head">
        {icon ? (
          <img className="tile-icon" src={icon} alt="" />
        ) : (
          <span className="tile-badge" aria-hidden="true">
            M€
          </span>
        )}
        <h3>{name}</h3>
      </header>

      <div className="production">
        <span className="production-label">Production</span>
        <div className="production-controls">
          <button
            className="prod-btn minus"
            aria-label={`Lower ${name} production`}
            disabled={production <= minProduction(resource)}
            onClick={() =>
              dispatch({ type: 'adjustProduction', key: resource, delta: -1 })
            }
          >
            −
          </button>
          <strong
            className="production-value"
            aria-label={`${name} production`}
          >
            {production}
          </strong>
          <button
            className="prod-btn plus"
            aria-label={`Raise ${name} production`}
            onClick={() =>
              dispatch({ type: 'adjustProduction', key: resource, delta: 1 })
            }
          >
            +
          </button>
        </div>
      </div>

      <div className="stock-block">
        <span className="stock-label">Stockpile</span>
        <NumberField
          className="stock"
          label={`${name} stockpile`}
          value={stock}
          onCommit={(value) =>
            dispatch({ type: 'setStock', key: resource, value })
          }
        />
      </div>

      <div className="steps">
        {steps.map((delta) => (
          <button
            key={delta}
            className="step"
            aria-label={`${delta > 0 ? 'Add' : 'Remove'} ${Math.abs(delta)} ${name}`}
            onClick={() =>
              dispatch({ type: 'adjustStock', key: resource, delta })
            }
          >
            {signed(delta)}
          </button>
        ))}
      </div>

      <p className="after">
        <span>After production</span>
        <strong>{afterProduction}</strong>
      </p>
    </section>
  )
}
