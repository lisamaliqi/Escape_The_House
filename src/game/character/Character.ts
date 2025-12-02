import { Application, Graphics } from 'pixi.js'
import type { Input } from '../engine/Input'
import type { Room } from '../rooms/roomTypes'

export class Character {
  sprite
  speed = 6

  /**
   * Executed when "new Character(app, input, room)" is called in main
   *
   * @param app Pixi application
   * @param input Input object, checks keys (up, down, left, right)
   * @param room Room object, checks for instance walkable function
   */
  constructor(app: Application, input: Input, room: Room) {
    const playerHeight = 100
    const playerWidth = 70

    this.sprite = new Graphics()
      .rect(-playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight) // center the rectangle
      .fill(0xff4444) // red rectangle (TEMPORARY)

    //starting position of the player
    this.sprite.position.set(app.screen.width / 2, app.screen.height / 2 + 60)

    //updates the canvas every frame
    app.ticker.add(() => this.update(input, room))
  }

  //update the characters position based on the input
  /**
   *
   * @param input Input object, checks keys (up, down, left, right)
   * @param room Room object, checks for instance walkable function
   */
  update = (input: Input, room: Room) => {
    let { x, y } = this.sprite

    // // movement
    if (input.up) y -= this.speed
    if (input.down) y += this.speed
    if (input.left) x -= this.speed
    if (input.right) x += this.speed

    const halfWidth = 35
    const footOffset = 50

    //three points at the characters feet for stopping at walls and objects
    const leftFootX = x - halfWidth
    const midFootX = x
    const rightFootX = x + halfWidth

    const footY = y + footOffset

    //all three points must be walkable to move
    const canWalk =
      room.isWalkable(leftFootX, footY) &&
      room.isWalkable(midFootX, footY) &&
      room.isWalkable(rightFootX, footY)

    if (canWalk) {
      this.sprite.x = x
      this.sprite.y = y
    }
  }
}
