import { Assets, Sprite } from 'pixi.js'

export type Door3to2 = {
  sprite: Sprite
}

export const createDoor3to2 = async (): Promise<Door3to2> => {
  const doorSheet = await Assets.load('/room3/objects/door3-2/door3-2.png')
  const door = new Sprite(doorSheet)

  door.anchor.set(0.5)
  door.x = 300
  door.y = 221

  return {
    sprite: door,
  }
}
