import type { InteractionSystem } from '../../engine/InteractionSystem'
import type { Inventory } from '../../engine/Inventory'
import type { Room2, Room2State } from './Room2'

export function registerRoom2Interactables(
  interactionSystem: InteractionSystem,
  room2: Room2,
  inventory: Inventory,
  useDoor2to1: () => void,
  state: Room2State
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

  //--- DRAWER ---
  const removeAllDrawerInteractables = () => {
    interactionSystem.removeInteractable('closed-drawer')
    interactionSystem.removeInteractable('opened-drawer-with-note')
    interactionSystem.removeInteractable('opened-drawer')
  }

  const addClosedDrawer = () => {
    removeAllDrawerInteractables()

    interactionSystem.addInteractable({
      id: 'closed-drawer',
      unlockId: null,
      getPosition: () => ({
        x: room2.drawer.sprite.x,
        y: room2.drawer.sprite.y,
      }),
      radius: 100,
      promptText: 'Press E to Open drawer',
      onInteract: () => {
        //Open drawer, if note is NOT collected
        if (!state.noteInDrawerCollected) {
          room2.drawer.setDrawerState('openWithNote')
          removeAllDrawerInteractables()
          addOpenedDrawerWithNote()
        } else {
          // if not IS already collected
          room2.drawer.setDrawerState('opened')
          removeAllDrawerInteractables()
          addOpenedDrawer()
        }
      },
    })
  }

  const addOpenedDrawerWithNote = () => {
    removeAllDrawerInteractables()
    room2.drawer.setDrawerState('openWithNote')

    interactionSystem.addInteractable({
      id: 'opened-drawer-with-note',
      unlockId: null,
      getPosition: () => ({
        x: room2.drawer.sprite.x,
        y: room2.drawer.sprite.y,
      }),
      radius: 100,
      promptText: 'Press E to Collect note',
      onInteract: () => {
        inventory.addItem('note1')
        state.noteInDrawerCollected = true
        room2.drawer.setDrawerState('opened')
        removeAllDrawerInteractables()
        addOpenedDrawer()
      },
    })
  }

  const addOpenedDrawer = () => {
    removeAllDrawerInteractables()
    room2.drawer.setDrawerState('opened')

    interactionSystem.addInteractable({
      id: 'opened-drawer',
      unlockId: null,
      getPosition: () => ({
        x: room2.drawer.sprite.x,
        y: room2.drawer.sprite.y,
      }),
      radius: 100,
      promptText: 'Press E to Close drawer',
      onInteract: () => {
        room2.drawer.setDrawerState('closed')
        removeAllDrawerInteractables()
        addClosedDrawer()
      },
    })
  }

  //init drawer when going to the room
  const currentDrawerState = room2.drawer.getDrawerState()

  if (currentDrawerState === 'closed') {
    addClosedDrawer()
  } else if (currentDrawerState === 'openWithNote') {
    addOpenedDrawerWithNote()
  } else if (currentDrawerState === 'opened') {
    addOpenedDrawer()
  }
}
