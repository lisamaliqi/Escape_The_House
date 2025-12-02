import { Assets, Sprite, type Application } from 'pixi.js'
import { createDoor2to1, type Door2to1 } from './door2-1'

export type Room2 = {
  sprite: Sprite
  door: Sprite
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

export const Room2 = async (app: Application): Promise<Room2> => {
  const texture = await Assets.load('/room2/room2.png')
  const room = new Sprite(texture)

  room.anchor.set(0.5)
  room.x = app.screen.width / 2
  room.y = app.screen.height / 2

  const maskImage = await loadMask('/room2/room2_mask.png')
  const { maskCanvas, maskData } = setupMask(maskImage)

  const door2to1: Door2to1 = await createDoor2to1()
  const door = door2to1.sprite

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
    isWalkable,
  }
}
