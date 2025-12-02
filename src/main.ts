import { Application } from 'pixi.js'
import { Character } from './game/character/Character'
import { Input } from './game/engine/Input'
import { InteractionSystem } from './game/engine/InteractionSystem'
import { Inventory } from './game/engine/Inventory'
import { registerRoom1Interactables } from './game/rooms/room1/Interactables'
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

  registerRoom1Interactables(interactionSystem, room1, inventory, app)
})()
