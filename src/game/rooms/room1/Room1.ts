import { Assets, Sprite, type Application } from 'pixi.js'

// draw mask image to canvas and get pixel data
const loadMask = (path: string): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const img = new Image()
    img.src = path
    img.onload = () => resolve(img)
  })

// setup mask canvas and pixel data
// looks if the pixel is walkable (white) or not (black)
const setupMask = (maskImage: HTMLImageElement) => {
  const maskCanvas = document.createElement('canvas') //create canvas el
  //make sure canvas is the same size as the image
  maskCanvas.width = maskImage.width
  maskCanvas.height = maskImage.height

  //draw image to canvas
  const maskCtx = maskCanvas.getContext('2d')!
  maskCtx.drawImage(maskImage, 0, 0)

  //get pixel data from canvas (HUGE array of rgba values)
  const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data

  return { maskCanvas, maskData }
}

export const Room1 = async (app: Application) => {
  //load up room
  const texture = await Assets.load('/room1/room1.png')
  const room = new Sprite(texture)

  //Center the anchor point to the middle of the room
  room.anchor.set(0.5)

  //place room in the center of the screen
  room.x = app.screen.width / 2
  room.y = app.screen.height / 2

  //make the room bigger
  room.scale.set(2)

  //load mask image
  const maskImage = await loadMask('/room1/room1_mask.png')
  const { maskCanvas, maskData } = setupMask(maskImage)

  //load spritesheet (animation) for safe object
  const safeSheet = await Assets.load('/room1/objects/safe/safe.json')

  const safeClosed = safeSheet.textures['{safe} 0.aseprite']
  const safeHalf = safeSheet.textures['{safe} 1.aseprite']
  const safeOpen = safeSheet.textures['{safe} 2.aseprite']

  const safe = new Sprite(safeClosed)

  safe.anchor.set(0.5)
  safe.x = 190
  safe.y = 290
  safe.scale.set(2)

  //state for safe animation
  type SafeState = 'closed' | 'half' | 'open'

  let safeState: SafeState = 'closed'
  let isTransitioning = false

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

    //closed -> half -> open
    if (safeState === 'closed') {
      setSafeState('half')
      setTimeout(() => {
        setSafeState('open')
        isTransitioning = false
      }, 150) // 150ms "half open"
    }
    //open -> half -> closed
    else if (safeState === 'open') {
      setSafeState('half')
      setTimeout(() => {
        setSafeState('closed')
        isTransitioning = false
      }, 150)
    } else {
      // fallback to closed state
      setSafeState('closed')
      isTransitioning = false
    }
  }

  // helper: is position walkable?
  const isWalkable = (worldX: number, worldY: number) => {
    // convert world → local (inside room1 image)
    const baseW = texture.width
    const baseH = texture.height

    const localX = (worldX - room.x) / room.scale.x + baseW * room.anchor.x
    const localY = (worldY - room.y) / room.scale.y + baseH * room.anchor.y

    const px = Math.floor(localX)
    const py = Math.floor(localY)

    if (px < 0 || py < 0 || px >= maskCanvas.width || py >= maskCanvas.height) return false

    const pixelIndex = (py * maskCanvas.width + px) * 4
    const pixelColorValue = maskData[pixelIndex] // white = walkable

    return pixelColorValue > 200 // bigger than 200 = white = walkable
  }

  return {
    sprite: room,
    safe,
    isWalkable,
    toggleSafe,
  }
}
