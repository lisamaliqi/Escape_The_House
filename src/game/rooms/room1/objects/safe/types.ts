import { Sprite } from 'pixi.js'

export type SafeState = 'closed' | 'half' | 'open'

export type SafePuzzle = {
  sprite: Sprite
  getSafeState: () => SafeState
  setSafeState: (state: SafeState) => void
  takeKey: () => void
  hasKey: () => boolean
}
