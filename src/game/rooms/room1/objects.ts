import { Assets, Sprite } from 'pixi.js'

export const room1Objects = async () => {
  // objects for inventory
  const shovelSheet = await Assets.load('/room1/objects/shovel/shovel.png')
  const shovel = new Sprite(shovelSheet)

  shovel.anchor.set(0.5)
  shovel.x = 500
  shovel.y = 240

  return {
    shovel,
  }
}
