import { Application } from 'pixi.js'
import { Character } from './game/character/Character'
import { Input } from './game/engine/Input'
import { InteractionSystem } from './game/engine/InteractionSystem'
import { Inventory } from './game/engine/Inventory'
import { registerRoom1Interactables } from './game/rooms/room1/Interactables'
import { Room1 } from './game/rooms/room1/Room1'
import { registerRoom2Interactables } from './game/rooms/room2/Interactables'
import { Room2 } from './game/rooms/room2/Room2'

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
  const room2 = await Room2(app) //create room2
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

  //put all the logic for going to room 2 from room
  const useDoor1to2 = () => {
    //remove all room1 sprites
    app.stage.removeChild(room1.sprite)
    app.stage.removeChild(room1.safe)
    app.stage.removeChild(room1.shovel)
    app.stage.removeChild(room1.door)
    app.stage.removeChild(room1.plant)

    //add room2 sprites
    app.stage.addChild(room2.sprite)
    app.stage.addChild(room2.door)

    //add character
    app.stage.addChild(character.sprite)
    character.setRoom(room2)

    //delete old interactables
    interactionSystem.clear()

    //register room2 interactables
    registerRoom2Interactables(interactionSystem, room2, inventory, app)

    //position character by the door
    character.sprite.x = room2.door.x + 20
    character.sprite.y = room2.door.y + 20
  }

  registerRoom1Interactables(interactionSystem, room1, inventory, app, useDoor1to2)
})()
