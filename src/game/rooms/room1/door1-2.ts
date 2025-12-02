import { Assets, Sprite } from 'pixi.js'

export type DoorState = 'closed' | 'half' | 'open'

export type Door1to2 = {
  sprite: Sprite
  openDoor: () => void
}

export const createDoor1to2 = async (): Promise<Door1to2> => {
  const doorSheet = await Assets.load('/room1/objects/door1-2/door1-2.json')

  const doorClosed = doorSheet.textures['{door1-2} 0.aseprite']
  const doorHalf = doorSheet.textures['{door1-2} 1.aseprite']
  const doorOpened = doorSheet.textures['{door1-2} 2.aseprite']

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
    // console.log('opened the door inside the log...')

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
