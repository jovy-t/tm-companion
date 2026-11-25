import energy from './assets/icons/energy.png'
import heat from './assets/icons/heat.png'
import plants from './assets/icons/plants.png'
import steel from './assets/icons/steel.png'
import titanium from './assets/icons/titanium.png'
import type { ResourceKey } from './types'

/** M€ has no image, so the tile draws a gold "M€" badge instead. */
export const RESOURCE_ICONS: Partial<Record<ResourceKey, string>> = {
  steel,
  titanium,
  plants,
  energy,
  heat,
}
