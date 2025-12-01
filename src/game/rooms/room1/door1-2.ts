import { Assets, Sprite } from 'pixi.js'

export const createDoor1to2 = async () => {
  const doorSheet = await Assets.load('/room1/objects/door1-2/door1-2.json')

  const doorClosed = doorSheet.textures['{door1-2} 0.aseprite']
  const doorHalf = doorSheet.textures['{door1-2} 1.aseprite']
  const doorOpened = doorSheet.textures['{door1-2} 2.aseprite']

  const door = new Sprite(doorClosed)

  door.anchor.set(0.5)
  door.x = 840
  door.y = 227
  door.scale.set(2)

  return {
    sprite: door,
  }
}
