import { AnimatedSprite, Application, Assets, Container, Sprite, Texture } from 'pixi.js'
import type { Input } from '../engine/Input'
import type { Room } from '../rooms/roomTypes'

export class Character {
  sprite: Container
  speed = 3
  private room: Room

  private idleSprite!: Sprite
  private downAnim!: AnimatedSprite
  private upAnim!: AnimatedSprite
  private isReady = false

  /**
   * Executed when "new Character(app, input, room)" is called in main
   *
   * @param app Pixi application
   * @param input Input object, checks keys (up, down, left, right)
   * @param room Room object, checks for instance walkable function
   */
  constructor(app: Application, input: Input, room: Room) {
    this.room = room

    //container that represents the players position
    this.sprite = new Container()
    this.sprite.position.set(app.screen.width / 2, app.screen.height / 2 + 60)

    //load animation + visuals in background
    void this.loadVisuals()

    //updates the canvas every frame
    app.ticker.add(() => this.update(input))
  }

  //set the room the character is inside
  setRoom(room: Room) {
    this.room = room
  }

  private async loadVisuals() {
    // Idle png (still)
    const idleTex = await Assets.load<Texture>('character/characterStill/characterStill.png')
    this.idleSprite = new Sprite(idleTex)
    this.idleSprite.anchor.set(0.5)

    // DOWN animation
    const downSheet = await Assets.load<any>('character/characterDown/characterDown.json')

    const downFrames: Texture[] = [
      downSheet.textures['{characterDown} 0.aseprite'],
      downSheet.textures['{characterDown} 1.aseprite'],
      downSheet.textures['{characterDown} 2.aseprite'],
      downSheet.textures['{characterDown} 3.aseprite'],
    ]

    this.downAnim = new AnimatedSprite(downFrames)
    this.downAnim.anchor.set(0.5)
    this.downAnim.animationSpeed = 0.15
    this.downAnim.loop = true
    this.downAnim.visible = false

    // --- UP animation ---
    const upSheet = await Assets.load<any>('character/characterUp/characterUp.json')

    const upFrames: Texture[] = [
      upSheet.textures['{characterUp} 0.aseprite'],
      upSheet.textures['{characterUp} 1.aseprite'],
      upSheet.textures['{characterUp} 2.aseprite'],
      upSheet.textures['{characterUp} 3.aseprite'],
    ]

    this.upAnim = new AnimatedSprite(upFrames)
    this.upAnim.anchor.set(0.5)
    this.upAnim.animationSpeed = 0.15
    this.upAnim.loop = true
    this.upAnim.visible = false

    // add textures and animations to container
    this.sprite.addChild(this.idleSprite, this.downAnim, this.upAnim)

    this.isReady = true
  }

  //update the characters position based on the input
  /**
   *
   * @param input Input object, checks keys (up, down, left, right)
   * @param room Room object, checks for instance walkable function
   */
  update = (input: Input) => {
    //if asset isnt loaded yet, dont do anything
    if (!this.isReady) return

    let x = this.sprite.x
    let y = this.sprite.y

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
      this.room.isWalkable(leftFootX, footY) &&
      this.room.isWalkable(midFootX, footY) &&
      this.room.isWalkable(rightFootX, footY)

    const isMoving = input.up || input.down || input.left || input.right

    if (canWalk) {
      this.sprite.x = x
      this.sprite.y = y
    }

    // --- VISUAL STATE ---
    if (isMoving && input.down) {
      // DOWN ANIMATION
      this.idleSprite.visible = false
      this.upAnim.visible = false

      this.downAnim.visible = true

      if (!this.downAnim.playing) this.downAnim.play()
    } else if (isMoving && input.up) {
      // UP ANIMATION
      this.idleSprite.visible = false
      this.downAnim.visible = false

      this.upAnim.visible = true

      if (!this.upAnim.playing) this.upAnim.play()
    } else {
      // IDLE (still) PNG
      this.downAnim.visible = false
      this.upAnim.visible = false

      this.idleSprite.visible = true
      if (this.downAnim.playing) this.downAnim.stop()
    }
  }
}
