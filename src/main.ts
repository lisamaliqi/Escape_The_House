import { Application } from 'pixi.js'
import { Character } from './game/character/Character'
import { Input } from './game/engine/Input'
import { InteractionSystem } from './game/engine/InteractionSystem'
import { Inventory } from './game/engine/Inventory'
import { Room1 } from './game/rooms/room1/Room1'

;(async () => {
  //initialize app
  const app = new Application()
  await app.init({
    width: 1200, //choose width and hight of canvas
    height: 700,
  })

  //put canvas on the page
  document.body.appendChild(app.canvas)

  const input = new Input() //init input handler (keys)
  const room1 = await Room1(app) //create room1
  const character = new Character(app, input, room1) //create character

  //add room
  app.stage.addChild(room1.sprite)

  //add objects behind character
  app.stage.addChild(room1.safe)
  app.stage.addChild(room1.shovel)
  app.stage.addChild(room1.door)

  //add character
  app.stage.addChild(character.sprite)

  //add objects in front of character
  app.stage.addChild(room1.plant)

  // --- Inventory ---
  const inventory = new Inventory()

  // --- InteractionSystem ---
  const interactionSystem = new InteractionSystem(
    app,
    input,
    () => ({
      // players "feet"
      x: character.sprite.x,
      y: character.sprite.y + 50, // same offset as the character
    }),
    inventory
  )

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
})()
