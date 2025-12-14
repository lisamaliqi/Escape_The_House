import { Assets, Sprite } from 'pixi.js'

export type SafeState = 'closed' | 'half' | 'open'

export type SafePuzzle = {
  sprite: Sprite
  toggle: () => void
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
  const safeHalf = safeSheet.textures['{safe} 1.aseprite']
  const safeOpen = safeSheet.textures['{safe} 2.aseprite']

  const safe = new Sprite(safeClosed)

  //position the safe correctly in the room
  safe.anchor.set(0.5)
  safe.x = 190
  safe.y = 290
  safe.scale.set(2)

  // --- SAFE STATE / CODE LOGIC ---

  let safeState: SafeState = 'closed'
  let isTransitioning = false

  const SAFE_CODE = '316472' // 6-digit code
  let isUnlocked = false // becomes true after correct code

  //function to change safe state (animation)
  const setSafeState = (state: SafeState) => {
    safeState = state
    if (state === 'closed') safe.texture = safeClosed
    if (state === 'half') safe.texture = safeHalf
    if (state === 'open') safe.texture = safeOpen
  }

  // initial value == closed
  setSafeState('closed')

  //click event to toggle safe state
  const toggleSafe = () => {
    if (isTransitioning) return
    isTransitioning = true

    // if open -> always allowed to close without code
    if (safeState === 'open') {
      setSafeState('half')
      setTimeout(() => {
        setSafeState('closed')
        isTransitioning = false
      }, 150)
      return
    }

    // if closed -> require correct code to open
    if (!isUnlocked) {
      const inputCode = window.prompt('Enter 6-digit code:') ?? ''

      if (inputCode.length !== 6 || inputCode !== SAFE_CODE) {
        // wrong code → stay closed
        isTransitioning = false
        alert('incorrect code!!!')
        return
      }

      // correct code -> safe stays unlocked for future opens
      isUnlocked = true
    }

    // now allowed to open
    setSafeState('half')
    setTimeout(() => {
      setSafeState('open')
      isTransitioning = false
    }, 150)
  }

  return {
    sprite: safe,
    toggle: toggleSafe,
  }
}
