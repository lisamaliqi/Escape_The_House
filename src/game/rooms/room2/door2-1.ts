import { Assets, Sprite } from 'pixi.js'

export type Door2to1 = {
  sprite: Sprite
}

export const createDoor2to1 = async (): Promise<Door2to1> => {
  const doorSheet = await Assets.load('/room2/objects/door2-1/door2-1.png')
  const door = new Sprite(doorSheet)

  door.anchor.set(0.5)
  door.x = 300
  door.y = 221

  return {
    sprite: door,
  }
}
