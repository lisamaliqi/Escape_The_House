import { Application, Assets, Graphics, Sprite } from 'pixi.js'

;(async () => {
  const app = new Application()

  await app.init({
    width: 1200,
    height: 800,
  })

  document.body.appendChild(app.canvas)

  // --- ROOM 1 ---
  //load up image of room 1
  const room1Texture = await Assets.load('/room1.png')
  const room1 = new Sprite(room1Texture)

  //Center the anchor point to the middle of the room
  room1.anchor.set(0.5)

  //place room in the center of the screen
  room1.x = app.screen.width / 2
  room1.y = app.screen.height / 2

  //make the room bigger
  room1.scale.set(2)

  //add the room to the canvas
  app.stage.addChild(room1)

  //----------------------------------------------
  // --- CHARACTER (currently a rectangle) ---
  const playerHeight = 50
  const playerWidth = 30

  const player = new Graphics()
  player
    .rect(-playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight) // center the rectangle
    .fill(0xff4444) // red rectangle

  // starting position of the player
  player.x = app.screen.width / 2
  player.y = app.screen.height / 2 + 60

  //add player to the canvas
  app.stage.addChild(player)
})()
