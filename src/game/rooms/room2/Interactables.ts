import type { InteractionSystem } from '../../engine/InteractionSystem'
import type { Room2 } from './Room2'

export function registerRoom2Interactables(
  interactionSystem: InteractionSystem,
  room2: Room2,
  useDoor2to1: () => void
) {
  interactionSystem.addInteractable({
    id: 'door2to1-enter',
    unlockId: null,
    getPosition: () => ({
      x: room2.door.x,
      y: room2.door.y + 40,
    }),
    radius: 60,
    promptText: 'Press E to go to Purple room',
    onInteract: () => {
      useDoor2to1() //use callback for using door 1 to 2 in room 1
      interactionSystem.removeInteractable('door2to1-enter')
    },
  })

  interactionSystem.addInteractable({
    id: 'drawer-with-note',
    unlockId: null,
    getPosition: () => ({
      x: room2.drawer.x,
      y: room2.drawer.y,
    }),
    radius: 100,
    promptText: 'Press E to open drawer',
    onInteract: () => {
      room2.openDrawer()
    },
  })
}
