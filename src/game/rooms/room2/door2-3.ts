import { Assets, Sprite } from 'pixi.js'

export type DoorState = 'closed' | 'half' | 'open'

export type Door2to3 = {
  sprite: Sprite
  openDoor: () => void
}

export const createDoor2to3 = async (): Promise<Door2to3> => {
  const doorSheet = await Assets.load('/room2/objects/door2-3/door2-3.json')

  const doorClosed = doorSheet.textures['{door2-3} 0.aseprite']
  const doorHalf = doorSheet.textures['{door2-3} 1.aseprite']
  const doorOpened = doorSheet.textures['{door2-3} 2.aseprite']

  const door = new Sprite(doorClosed)

  door.anchor.set(0.5)
  door.x = 840
  door.y = 227
  door.scale.set(2)

  let doorState: DoorState = 'closed'

  const setDoorState = (state: DoorState) => {
    doorState = state
    if (state === 'closed') door.texture = doorClosed
    if (state === 'half') door.texture = doorHalf
    if (state === 'open') door.texture = doorOpened
  }

  const openDoor = () => {
    if (doorState === 'closed') {
      setDoorState('half')
      setTimeout(() => {
        setDoorState('open')
      }, 150)
      return
    }
  }

  return {
    sprite: door,
    openDoor,
  }
}
