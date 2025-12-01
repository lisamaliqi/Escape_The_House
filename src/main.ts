import { Application } from 'pixi.js'
import { Character } from './game/character/Character'
import { Input } from './game/engine/Input'
import { InteractionSystem } from './game/engine/InteractionSystem'
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

  //add character
  app.stage.addChild(character.sprite)

  //add objects in front of character
  app.stage.addChild(room1.plant)

  // --- InteractionSystem ---
  const interactionSystem = new InteractionSystem(app, input, () => ({
    // players "feet"
    x: character.sprite.x,
    y: character.sprite.y + 50, // same offset as the character
  }))

  //register safe as an interactable object
  interactionSystem.addInteractable({
    id: 'safe',
    getPosition: () => ({
      x: room1.safe.x,
      y: room1.safe.y + 40,
    }),
    radius: 100,
    onInteract: room1.toggleSafe,
    promptText: 'Press E to open',
  })

  interactionSystem.addInteractable({
    id: 'blomkruka',
    getPosition: () => ({
      x: room1.plant.x,
      y: room1.plant.y + 40,
    }),
    radius: 70,
    onInteract: room1.dig,
    promptText: 'Press E to Dig',
  })
})()
