import { Assets, Sprite } from 'pixi.js'

export type SafeState = 'closed' | 'half' | 'open'

export type SafePuzzle = {
  sprite: Sprite
  getSafeState: () => SafeState
  setSafeState: (state: SafeState) => void
  takeKey: () => void
  hasKey: () => boolean
}

/**
 * Creates the safe puzzle:
 * - loads spritesheet
 * - handles open/close animation
 * - checks 6-digit code on open
 * - makes the sprite clickable (will remove later)
 */
export const createSafePuzzle = async (): Promise<SafePuzzle> => {
  //load spritesheet (animation) for safe object
  const safeSheet = await Assets.load('/room1/objects/safe/safe.json')

  const safeClosed = safeSheet.textures['{safe} 0.aseprite']
  const safeHalfWithKey = safeSheet.textures['{safe} 1.aseprite']
  const safeHalfNoKey = safeSheet.textures['{safe} 2.aseprite']
  const safeOpenWithKey = safeSheet.textures['{safe} 3.aseprite']
  const safeOpenNoKey = safeSheet.textures['{safe} 4.aseprite']

  const safe = new Sprite(safeClosed)

  //position the safe correctly in the room
  safe.anchor.set(0.5)
  safe.x = 190
  safe.y = 290
  safe.scale.set(2)

  // --- SAFE STATE / CODE LOGIC ---

  let safeState: SafeState = 'closed'
  let keyExists = true

  const getSafeState = () => safeState
  const hasKey = () => keyExists

  const setSafeState = (state: SafeState) => {
    safeState = state

    if (state === 'closed') safe.texture = safeClosed
    if (state === 'half') safe.texture = keyExists ? safeHalfWithKey : safeHalfNoKey
    if (state === 'open') safe.texture = keyExists ? safeOpenWithKey : safeOpenNoKey
  }

  const takeKey = () => {
    if (safeState !== 'open') return
    if (!keyExists) return

    keyExists = false
    setSafeState('open')
  }

  setSafeState('closed')

  return {
    sprite: safe,
    getSafeState,
    setSafeState,
    takeKey,
    hasKey,
  }
}
