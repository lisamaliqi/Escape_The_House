import { Assets, Sprite } from 'pixi.js'
import type { SafePuzzle, SafeState } from './types'

/**
 * Creates the safe puzzle
 */
export const createSafePuzzle = async (): Promise<SafePuzzle> => {
  //load spritesheet (states) for safe object
  const safeSheet = await Assets.load('/room1/objects/safe/safe.json')

  const closed = safeSheet.textures['{safe} 0.aseprite']
  const halfWithKey = safeSheet.textures['{safe} 1.aseprite']
  const half = safeSheet.textures['{safe} 2.aseprite']
  const openWithKey = safeSheet.textures['{safe} 3.aseprite']
  const open = safeSheet.textures['{safe} 4.aseprite']

  const safe = new Sprite(closed) //starting sprite

  //position the safe correctly in the room
  safe.anchor.set(0.5)
  safe.x = 190
  safe.y = 290
  safe.scale.set(2)

  // --- SAFE STATE / CODE LOGIC ---

  let safeState: SafeState = 'closed' //starting state
  let keyExists = true

  //read only access (no mutation)
  const getSafeState = () => safeState
  const hasKey = () => keyExists

  //update safe texture depending on safe-state and key-status
  const setSafeState = (state: SafeState) => {
    safeState = state

    if (state === 'closed') safe.texture = closed
    if (state === 'half') safe.texture = keyExists ? halfWithKey : half
    if (state === 'open') safe.texture = keyExists ? openWithKey : open
  }

  //pick up the key
  const takeKey = () => {
    if (safeState !== 'open') return //only if safe is open
    if (!keyExists) return //only once

    keyExists = false
    setSafeState('open')
  }

  //init state
  setSafeState('closed')

  return {
    sprite: safe,
    getSafeState,
    setSafeState,
    takeKey,
    hasKey,
  }
}
