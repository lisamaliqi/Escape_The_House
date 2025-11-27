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

  //load safe
  const safeTexture = await Assets.load('/room1/objects/safe/safe.png')
  const safe = new Sprite(safeTexture)

  safe.anchor.set(0.5)
  safe.x = 190
  safe.y = 290
  safe.scale.set(2)

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
  }
}
