import { Application } from 'pixi.js'
import { Character } from './game/character/Character'
import { Input } from './game/engine/Input'
import { InteractionSystem } from './game/engine/InteractionSystem'
import { Inventory } from './game/engine/Inventory'
import { registerRoom1Interactables } from './game/rooms/room1/Interactables'
import { Room1, type Room1State } from './game/rooms/room1/Room1'
import { registerRoom2Interactables } from './game/rooms/room2/Interactables'
import { Room2, type Room2State } from './game/rooms/room2/Room2'
import { registerRoom3Interactables } from './game/rooms/room3/Interactables'
import { Room3, type Room3State } from './game/rooms/room3/Room3'

;(async () => {
  //create wrapper for game
  const wrapper = document.createElement('div')
  wrapper.id = 'game-wrapper'
  document.body.appendChild(wrapper)

  //initialize app
  const app = new Application()
  await app.init({
    width: 1200, //choose width and hight of canvas
    height: 700,
  })

  //put canvas on the page
  wrapper.appendChild(app.canvas)

  // --- Inventory ---
  const inventoryContainer = document.createElement('div')
  inventoryContainer.id = 'inventory-bar'
  wrapper.appendChild(inventoryContainer)

  const inventory = new Inventory(inventoryContainer)

  const input = new Input() //init input handler (keys)
  const room1 = await Room1(app) //create room1
  const room2 = await Room2(app) //create room2
  const room3 = await Room3(app) //create room2
  const character = new Character(app, input, room1) //create character

  const room1State: Room1State = {
    door1to2Unlocked: false,
    shovelCollected: false,
    plantDig: false,
    key1Collected: false,
    safeUnlocked: false,
    blackKeyCollected: false,
  }

  const room2State: Room2State = {
    noteInDrawerCollected: false,
    colorWheelCollected: false,
    door2to3Opened: false,
  }

  const room3State: Room3State = {
    noteInCabinetCollected: false,
  }

  //add room
  app.stage.addChild(room1.sprite)

  //add objects behind character
  app.stage.addChild(room1.safePuzzle.sprite)
  app.stage.addChild(room1.shovel)
  app.stage.addChild(room1.door)

  //add character
  app.stage.addChild(character.sprite)

  //add objects in front of character
  app.stage.addChild(room1.plant)

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
    app.stage.removeChild(room1.safePuzzle.sprite)
    app.stage.removeChild(room1.shovel)
    app.stage.removeChild(room1.door)
    app.stage.removeChild(room1.plant)

    //add room2 sprites
    app.stage.addChild(room2.sprite)
    app.stage.addChild(room2.door)
    app.stage.addChild(room2.door2)
    app.stage.addChild(room2.drawer.sprite)
    app.stage.addChild(room2.painting.sprite)

    //add character
    app.stage.addChild(character.sprite)
    character.setRoom(room2)

    //push prompt to the front
    interactionSystem.bringPromptToFront()

    //delete old interactables
    interactionSystem.clear()

    //register room2 interactables
    registerRoom2Interactables(
      interactionSystem,
      room2,
      inventory,
      useDoor2to1,
      useDoor2to3,
      room2State
    )

    //position character by the door
    character.sprite.x = room2.door.x + 20
    character.sprite.y = room2.door.y + 20
  }

  const useDoor2to1 = () => {
    //remove all room2 sprites
    app.stage.removeChild(room2.sprite)
    app.stage.removeChild(room2.door)
    app.stage.removeChild(room2.door2)
    app.stage.removeChild(room2.drawer.sprite)
    app.stage.removeChild(room2.drawer.sprite)
    app.stage.removeChild(room2.painting.sprite)

    //add room1 sprites
    app.stage.addChild(room1.sprite)
    app.stage.addChild(room1.safePuzzle.sprite)
    if (!room1State.shovelCollected) app.stage.addChild(room1.shovel)
    app.stage.addChild(room1.door)

    //add character
    app.stage.addChild(character.sprite)
    character.setRoom(room1)

    app.stage.addChild(room1.plant)

    //push prompt to the front
    interactionSystem.bringPromptToFront()

    //delete old interactables
    interactionSystem.clear()

    //register room1 interactables
    registerRoom1Interactables(interactionSystem, room1, inventory, app, useDoor1to2, room1State)

    //position character by the door
    character.sprite.x = room1.door.x + 60
    character.sprite.y = room1.door.y + 20
  }

  const useDoor2to3 = () => {
    //remove all room2 sprites
    app.stage.removeChild(room2.sprite)
    app.stage.removeChild(room2.door)
    app.stage.removeChild(room2.door2)
    app.stage.removeChild(room2.drawer.sprite)
    app.stage.removeChild(room2.drawer.sprite)
    app.stage.removeChild(room2.painting.sprite)

    //add room3 sprites
    app.stage.addChild(room3.sprite)
    app.stage.addChild(room3.door)

    app.stage.addChild(character.sprite)
    character.setRoom(room3)

    app.stage.addChild(room3.sinkCabinetPuzzle.sprite)

    //push prompt to the front
    interactionSystem.bringPromptToFront()

    //delete old interactables
    interactionSystem.clear()

    //register room3 interactables
    registerRoom3Interactables(interactionSystem, room3, inventory, useDoor3to2, room3State)

    //position character by the door
    character.sprite.x = room3.door.x + 20
    character.sprite.y = room3.door.y + 20
  }

  const useDoor3to2 = () => {
    //remove room3 sprites
    app.stage.removeChild(room3.sprite)
    app.stage.removeChild(room3.door)
    app.stage.removeChild(room3.sinkCabinetPuzzle.sprite)

    //add room2 sprites
    app.stage.addChild(room2.sprite)
    app.stage.addChild(room2.door)
    app.stage.addChild(room2.door2)
    app.stage.addChild(room2.drawer.sprite)
    app.stage.addChild(room2.drawer.sprite)
    app.stage.addChild(room2.painting.sprite)

    app.stage.addChild(character.sprite)
    character.setRoom(room2)

    //push prompt to the front
    interactionSystem.bringPromptToFront()

    //delete old interactables
    interactionSystem.clear()

    //register room2 interactables
    registerRoom2Interactables(
      interactionSystem,
      room2,
      inventory,
      useDoor2to1,
      useDoor2to3,
      room2State
    )

    //position character by the door
    character.sprite.x = room2.door2.x + 60
    character.sprite.y = room2.door2.y + 20
  }

  registerRoom1Interactables(interactionSystem, room1, inventory, app, useDoor1to2, room1State)
})()
