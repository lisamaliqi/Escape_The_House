import type { InteractionSystem } from '../../engine/InteractionSystem'
import type { Room3 } from './Room3'

export function registerRoom3Interactables(
  interactionSystem: InteractionSystem,
  room3: Room3,
  useDoor3to2: () => void
) {
  interactionSystem.addInteractable({
    id: 'door3to2-enter',
    unlockId: null,
    getPosition: () => ({
      x: room3.door.x,
      y: room3.door.y + 40,
    }),
    radius: 60,
    promptText: 'Press E to go to Red room',
    onInteract: () => {
      useDoor3to2()
      interactionSystem.removeInteractable('door3to2-enter')
    },
  })
}
