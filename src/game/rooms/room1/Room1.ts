import { Assets, Sprite, type Application } from 'pixi.js'
import { createDoor1to2, type Door1to2 } from './door1-2'
import { room1Objects } from './objects'
import { createPlantPuzzle, type PlantPuzzle } from './plantPuzzle'
import { createSafePuzzle, type SafePuzzle } from './safePuzzle'

export type Room1 = {
  sprite: Sprite
  safePuzzle: SafePuzzle
  plant: Sprite
  dig: () => void
  door: Sprite
  openDoor: () => void
  isWalkable: (worldX: number, worldY: number) => boolean
  shovel: Sprite
}

export type Room1State = {
  door1to2Unlocked: boolean
  shovelCollected: boolean
  plantDig: boolean
  key1Collected: boolean
  safeUnlocked: boolean
  blackKeyCollected: boolean
}

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

export const Room1 = async (app: Application): Promise<Room1> => {
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

  // create safe puzzle
  const safePuzzle: SafePuzzle = await createSafePuzzle()
  // const safe = safePuzzle.sprite //safe sprite

  //create plant puzzle
  const plantPuzzle: PlantPuzzle = await createPlantPuzzle()
  const plant = plantPuzzle.sprite

  //create door from room 1 to 2
  const door1to2: Door1to2 = await createDoor1to2()
  const door = door1to2.sprite

  //get objects for room 1
  const shovelInventory = await room1Objects()
  const shovel = shovelInventory.shovel

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
    safePuzzle,
    plant,
    dig: plantPuzzle.dig,
    door,
    openDoor: door1to2.openDoor,
    isWalkable,
    shovel,
  }
}
