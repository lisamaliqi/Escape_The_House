import { Assets, Sprite } from 'pixi.js'

export type OutsideDoorState = 'closed' | 'opened'

export type OutsideDoor = {
  sprite: Sprite
  openDoor: () => void
}

export const createOutsideDoor = async (): Promise<OutsideDoor> => {
  const outsideDoorSheet = await Assets.load('/room2/objects/outsideDoor/outsideDoor.json')

  const doorClosed = outsideDoorSheet.textures['{outsideDoor} 0.aseprite']
  const doorOpened = outsideDoorSheet.textures['{outsideDoor} 1.aseprite']

  const door = new Sprite(doorClosed)

  door.anchor.set(0.5)
  door.x = 380
  door.y = 370

  let doorState: OutsideDoorState = 'closed'

  const setDoorState = (state: OutsideDoorState) => {
    doorState = state
    if (state === 'closed') door.texture = doorClosed
    if (state === 'opened') door.texture = doorOpened
  }

  const openDoor = () => {
    if (doorState === 'closed') {
      setDoorState('opened')
    }
  }

  return {
    sprite: door,
    openDoor,
  }
}
