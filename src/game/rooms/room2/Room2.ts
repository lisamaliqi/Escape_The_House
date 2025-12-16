import { Assets, Sprite, type Application } from 'pixi.js'
import { createDoor2to1, type Door2to1 } from './door2-1'
import { createDoor2to3, type Door2to3 } from './door2-3'
import { createDrawerPuzzle, type DrawerPuzzle } from './drawerPuzzle'
import { createOutsideDoor, type OutsideDoor } from './outsideDoor'
import { createPaintingPuzzle, type PaintingPuzzle } from './paintingPuzzle'

export type Room2 = {
  sprite: Sprite
  door: Sprite
  door2: Sprite
  openDoor2: () => void
  outsideDoor: Sprite
  openOutsideDoor: () => void
  drawer: DrawerPuzzle
  painting: PaintingPuzzle
  isWalkable: (worldX: number, worldY: number) => boolean
}

export type Room2State = {
  noteInDrawerCollected: boolean
  colorWheelCollected: boolean
  door2to3Opened: boolean
  outsideDoorOpened: boolean
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

  const door2to3: Door2to3 = await createDoor2to3()
  const door2 = door2to3.sprite

  const buildOutsideDoor: OutsideDoor = await createOutsideDoor()
  const outsideDoor = buildOutsideDoor.sprite

  const drawerPuzzle: DrawerPuzzle = await createDrawerPuzzle()
  //   const drawer = drawerPuzzle.sprite

  const paintingPuzzle: PaintingPuzzle = await createPaintingPuzzle()

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
    door2,
    openDoor2: door2to3.openDoor,
    outsideDoor,
    openOutsideDoor: buildOutsideDoor.openDoor,
    drawer: drawerPuzzle,
    painting: paintingPuzzle,
    isWalkable,
  }
}
