import type { InteractionSystem } from '../../engine/InteractionSystem'
import type { Inventory } from '../../engine/Inventory'
import type { Room2, Room2State } from './Room2'

export function registerRoom2Interactables(
  interactionSystem: InteractionSystem,
  room2: Room2,
  inventory: Inventory,
  useDoor2to1: () => void,
  useDoor2to3: () => void,
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

  //--- PAINTING ---
  const removeAllPaintingInteractables = () => {
    interactionSystem.removeInteractable('stillPainting')
    interactionSystem.removeInteractable('moved-with-colorWheel')
    interactionSystem.removeInteractable('movedPainting')
  }

  const addStillPainting = () => {
    removeAllPaintingInteractables()

    interactionSystem.addInteractable({
      id: 'stillPainting',
      unlockId: null,
      getPosition: () => ({
        x: room2.painting.sprite.x,
        y: room2.painting.sprite.y + 70,
      }),
      radius: 70,
      promptText: 'Press E to Move',
      onInteract: () => {
        if (!state.colorWheelCollected) {
          //show colorWheel sprite frame
          room2.painting.setPaintingState('withColorWheel')
          removeAllPaintingInteractables()
          addMovedPaintingWithColorWheel()
        } else {
          //show regular moved painting frame
          room2.painting.setPaintingState('moved')
          removeAllPaintingInteractables()
          addMovedPainting()
        }
      },
    })
  }

  const addMovedPaintingWithColorWheel = () => {
    removeAllPaintingInteractables()
    room2.painting.setPaintingState('withColorWheel')

    interactionSystem.addInteractable({
      id: 'moved-with-colorWheel',
      unlockId: null,
      getPosition: () => ({
        x: room2.painting.sprite.x,
        y: room2.painting.sprite.y + 70,
      }),
      radius: 70,
      promptText: 'Press E to Collect Color Wheel',
      onInteract: () => {
        inventory.addItem('colorWheel')
        state.colorWheelCollected = true
        room2.painting.setPaintingState('moved')
        removeAllPaintingInteractables()
        addMovedPainting()
      },
    })
  }

  const addMovedPainting = () => {
    removeAllPaintingInteractables()
    room2.painting.setPaintingState('moved')

    interactionSystem.addInteractable({
      id: 'movedPainting',
      unlockId: null,
      getPosition: () => ({
        x: room2.painting.sprite.x,
        y: room2.painting.sprite.y + 70,
      }),
      radius: 70,
      promptText: 'Press E to Move',
      onInteract: () => {
        room2.painting.setPaintingState('still')
        removeAllPaintingInteractables()
        addStillPainting()
      },
    })
  }

  //init painting when going to the room
  const currentPaintingState = room2.painting.getPaintingState()

  if (currentPaintingState === 'still') {
    addStillPainting()
  } else if (currentPaintingState === 'withColorWheel') {
    addMovedPaintingWithColorWheel()
  } else if (currentPaintingState === 'moved') {
    addMovedPainting()
  }

  //---DOOR 2 TO 3---
  if (!state.door2to3Opened) {
    //if door is closed
    interactionSystem.addInteractable({
      id: 'door2to3-open',
      unlockId: null,
      getPosition: () => ({
        x: room2.door2.x + 70,
        y: room2.door2.y + 40,
      }),
      radius: 40,
      promptText: 'Press E to open the door',
      onInteract: () => {
        room2.openDoor2()
        state.door2to3Opened = true

        interactionSystem.removeInteractable('door2to3-open')

        //add zone to walk to room3 (needs function to walk to room 3)
        interactionSystem.addInteractable({
          id: 'door2to3-enter',
          unlockId: null,
          getPosition: () => ({
            x: room2.door2.x + 70,
            y: room2.door2.y + 40,
          }),
          radius: 40,
          promptText: 'Press E to go to Room 3',
          onInteract: () => {
            useDoor2to3()
            interactionSystem.removeInteractable('door2to3-enter')
          },
        })
      },
    })
  } else {
    //door already open, stays open even when changing rooms
    interactionSystem.addInteractable({
      id: 'door2to3-enter',
      unlockId: null,
      getPosition: () => ({
        x: room2.door2.x + 70,
        y: room2.door2.y + 40,
      }),
      radius: 40,
      promptText: 'Press E to go to Room 3',
      onInteract: () => {
        useDoor2to3()
        interactionSystem.removeInteractable('door2to3-enter')
      },
    })
  }
}
