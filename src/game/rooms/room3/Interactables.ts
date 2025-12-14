import type { InteractionSystem } from '../../engine/InteractionSystem'
import type { Inventory } from '../../engine/Inventory'
import type { Room3, Room3State } from './Room3'

export function registerRoom3Interactables(
  interactionSystem: InteractionSystem,
  room3: Room3,
  inventory: Inventory,
  useDoor3to2: () => void,
  state: Room3State
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

  // --- SINK CABINET ---

  const removeAllSinkCabinetInteractables = () => {
    interactionSystem.removeInteractable('sink-cabinet-closed')
    interactionSystem.removeInteractable('sink-cabinet-opened-with-note')
    interactionSystem.removeInteractable('sink-cabinet-opened-empty')
  }

  const addSinkCabinetClosed = () => {
    removeAllSinkCabinetInteractables()
    room3.sinkCabinetPuzzle.setSinkCabinetState('closed')

    interactionSystem.addInteractable({
      id: 'sink-cabinet-closed',
      unlockId: null,
      getPosition: () => ({
        x: room3.sinkCabinetPuzzle.sprite.x,
        y: room3.sinkCabinetPuzzle.sprite.y + 90,
      }),
      radius: 60,
      promptText: state.noteInCabinetCollected
        ? 'Press E to Open cabinet'
        : 'Press E to Unlock cabinet',
      onInteract: async () => {
        if (state.noteInCabinetCollected) {
          removeAllSinkCabinetInteractables()
          if (state.noteInCabinetCollected) addSinkCabinetOpened()
          else addSinkCabinetOpenedWithNote()
          return
        }

        const unlocked = await room3.sinkCabinetPuzzle.openLock()

        if (!unlocked) return

        removeAllSinkCabinetInteractables()
        addSinkCabinetOpenedWithNote()
      },
    })
  }

  const addSinkCabinetOpenedWithNote = () => {
    removeAllSinkCabinetInteractables()
    room3.sinkCabinetPuzzle.setSinkCabinetState('opened')

    interactionSystem.addInteractable({
      id: 'sink-cabinet-opened-with-note',
      unlockId: null,
      getPosition: () => ({
        x: room3.sinkCabinetPuzzle.sprite.x,
        y: room3.sinkCabinetPuzzle.sprite.y + 90,
      }),
      radius: 60,
      promptText: 'Press E to Collect note',
      onInteract: () => {
        inventory.addItem('note2')
        state.noteInCabinetCollected = true
        removeAllSinkCabinetInteractables()
        addSinkCabinetOpened()
      },
    })
  }

  const addSinkCabinetOpened = () => {
    removeAllSinkCabinetInteractables()
    room3.sinkCabinetPuzzle.setSinkCabinetState('opened')

    interactionSystem.addInteractable({
      id: 'sink-cabinet-opened-empty',
      unlockId: null,
      getPosition: () => ({
        x: room3.sinkCabinetPuzzle.sprite.x,
        y: room3.sinkCabinetPuzzle.sprite.y + 90,
      }),
      radius: 60,
      promptText: 'Press E to Close cabinet',
      onInteract: () => {
        room3.sinkCabinetPuzzle.setSinkCabinetState('closed')
        removeAllSinkCabinetInteractables()
        addSinkCabinetClosed()
      },
    })
  }

  const cabinetState = room3.sinkCabinetPuzzle.getSinkCabinetState()

  if (cabinetState === 'closed') {
    addSinkCabinetClosed()
  } else if (state.noteInCabinetCollected) {
    addSinkCabinetOpened()
  } else {
    addSinkCabinetOpenedWithNote()
  }
}
