import { Application } from 'pixi.js'
import { Character } from './game/character/Character'
import { Input } from './game/engine/Input'
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

  //add room and character to canvas so they are visible
  app.stage.addChild(room1.sprite)
  app.stage.addChild(character.sprite)
})()
