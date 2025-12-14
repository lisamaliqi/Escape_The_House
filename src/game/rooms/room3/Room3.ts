import { Assets, Sprite, type Application } from 'pixi.js'
import { createDoor3to2, type Door3to2 } from './door3-2'
import { createSinkCabinetPuzzle, type SinkCabinetPuzzle } from './sinkCabinet'

export type Room3 = {
  sprite: Sprite
  door: Sprite
  sinkCabinet: Sprite
  isWalkable: (worldX: number, worldY: number) => boolean
}

//load mask to canvas
const loadMask = (path: string): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const img = new Image()
    img.src = path
    img.onload = () => resolve(img)
  })

//setup mask to canvas, check if walkable
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

export const Room3 = async (app: Application): Promise<Room3> => {
  const texture = await Assets.load('/room3/room3.png')
  const room = new Sprite(texture)

  room.anchor.set(0.5)
  room.x = app.screen.width / 2
  room.y = app.screen.height / 2

  const maskImage = await loadMask('/room3/room3_mask.png')
  const { maskCanvas, maskData } = setupMask(maskImage)

  const door3to2: Door3to2 = await createDoor3to2()
  const door = door3to2.sprite

  const sinkCabinetPuzzle: SinkCabinetPuzzle = await createSinkCabinetPuzzle()
  const sinkCabinet = sinkCabinetPuzzle.sprite

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
    door,
    sinkCabinet,
    isWalkable,
  }
}
