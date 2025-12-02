import type { Application } from 'pixi.js'
import type { InteractionSystem } from '../../engine/InteractionSystem'
import type { Inventory } from '../../engine/Inventory'
import type { Room1 } from './Room1'

export function registerRoom1Interactables(
  interactionSystem: InteractionSystem,
  room1: Room1,
  inventory: Inventory,
  app: Application,
  useDoor1to2: () => void
) {
  //register safe as an interactable object
  interactionSystem.addInteractable({
    id: 'safe',
    unlockId: null,
    getPosition: () => ({
      x: room1.safe.x,
      y: room1.safe.y + 40,
    }),
    radius: 100,
    onInteract: room1.toggleSafe,
    promptText: 'Press E to open',
  })

  interactionSystem.addInteractable({
    id: 'blomkruka-dig',
    unlockId: 'shovel',
    getPosition: () => ({
      x: room1.plant.x,
      y: room1.plant.y + 40,
    }),
    radius: 70,
    onInteract: () => {
      room1.dig() //change plant state (change frame), change this in future to third frame
      interactionSystem.removeInteractable('blomkruka-dig') //remove so we can't "dig" again

      //create new interactable object to collect key
      interactionSystem.addInteractable({
        id: 'blomkruka-key-collect',
        unlockId: null,
        getPosition: () => ({
          x: room1.plant.x,
          y: room1.plant.y + 40,
        }),
        radius: 70,
        promptText: 'Press E to collect the key',
        onInteract: () => {
          inventory.addItem('key1') //add key to inventory
          // room1.dig() //change this in future to correct state
          interactionSystem.removeInteractable('blomkruka-key-collect') //remove to not collect again
        },
      })
    },
    promptText: 'Press E to Dig',
    lockedText: 'Maybe find something to dig with?',
  })

  interactionSystem.addInteractable({
    id: 'shovel',
    unlockId: null,
    getPosition: () => ({
      x: room1.shovel.x,
      y: room1.shovel.y + 40,
    }),
    radius: 30,
    onInteract: () => {
      inventory.addItem('shovel') //add to inventory
      app.stage.removeChild(room1.shovel) //remove from canvas
      interactionSystem.removeInteractable('shovel') //remove shovel as interactable object
    },
    promptText: 'Press E to collect',
  })

  interactionSystem.addInteractable({
    id: 'door1to2',
    unlockId: 'key1',
    getPosition: () => ({
      x: room1.door.x + 70,
      y: room1.door.y + 40,
    }),
    radius: 40,
    onInteract: () => {
      room1.openDoor()
      interactionSystem.removeInteractable('door1to2')

      interactionSystem.addInteractable({
        id: 'door1to2-enter',
        unlockId: null,
        getPosition: () => ({
          x: room1.door.x + 70,
          y: room1.door.y + 40,
        }),
        radius: 40,
        promptText: 'Press E to go to Room 2',
        onInteract: () => {
          useDoor1to2() //use callback for using door 1 to 2 in room 1
          interactionSystem.removeInteractable('door1to2-enter')
        },
      })
    },
    promptText: 'Press E to use the key',
    lockedText: 'Need a key to open',
  })
}
