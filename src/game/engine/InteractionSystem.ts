import { Application, Container, Graphics, Text } from 'pixi.js'
import type { Input } from './Input'
import type { Inventory } from './Inventory'

//interaction system to handle character interactions with objects
/**
 * Supposed to handle all interactive objects
 * Check if character is close enough to interact
 * Show prompt text when in range
 * Handle interaction on key press (Input.interact)
 */

interface Interactable {
  id: string //name of the interactable object
  unlockId: string | null //name of the item that unlocks this object
  getPosition: () => { x: number; y: number } // ex. safe-position
  radius: number // how close the character must be to interact
  onInteract?: () => void //what happens on interaction
  promptText: string //text to show when in range of interaction
  lockedText?: string
}

type GetCharacterFeetFn = () => { x: number; y: number }

export class InteractionSystem {
  //properties
  private app: Application //pixi application
  private input: Input //key press
  private getCharacterFeet: GetCharacterFeetFn //get character position
  private inventory: Inventory
  private interactables: Interactable[] = [] //list of interactable objects
  private current: Interactable | null = null //current active interactable object
  private promptContainer: Container
  private promptBg: Graphics
  private promptTextObject: Text
  private prevInteract = false

  constructor(
    app: Application,
    input: Input,
    getCharacterFeet: GetCharacterFeetFn,
    inventory: Inventory
  ) {
    //put argument values to class properties
    this.app = app
    this.input = input
    this.getCharacterFeet = getCharacterFeet
    this.inventory = inventory
    this.promptContainer = new Container()
    this.promptBg = new Graphics()
    this.promptContainer.addChild(this.promptBg)

    this.promptTextObject = new Text({
      text: '',
      style: {
        fill: 0xffffff,
        fontSize: 16,
      },
    })

    this.promptTextObject.x = 10
    this.promptTextObject.y = 6

    this.promptContainer.addChild(this.promptTextObject) //add text to container
    this.app.stage.addChild(this.promptContainer) //add container to app
    this.promptContainer.visible = false //make it initially not visible (will turn visible when close to an object)

    //loop to update function every frame
    this.app.ticker.add(() => this.update())
  }

  //draw background in prompt text
  private redrawPromptBackground() {
    const padX = 10
    const padY = 6
    const radius = 6

    const w = this.promptTextObject.width + padX * 2
    const h = this.promptTextObject.height + padY * 2

    this.promptBg.clear()
    this.promptBg.roundRect(0, 0, w, h, radius).fill({ color: 0x000000, alpha: 0.6 })
  }

  //register an interactable object, called from main.ts
  addInteractable(interactable: Interactable) {
    this.interactables.push(interactable)
  }

  //update function called every frame from app.ticker from pixi
  update() {
    /**
     * Check distance between character and interactable objects
     * Find closest interactable within radius
     * Save as current active interactable
     * Show prompt text when in range
     * Listen for input.interact key press to trigger onInteract
     */

    //get the character position
    const characterPosition = this.getCharacterFeet()
    // console.log('characterPosition: ', characterPosition)
    const characterPositionX = characterPosition.x
    const characterPositionY = characterPosition.y

    //loop through interactable objects to find closest
    let closest: Interactable | null = null
    let closestDist = Infinity

    for (let i = 0; i < this.interactables.length; i++) {
      const object = this.interactables[i]
      const position = object.getPosition()

      const distanceX = position.x - characterPositionX
      const distanceY = position.y - characterPositionY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (distance <= object.radius && distance < closestDist) {
        closest = object
        closestDist = distance
      }
    }

    this.current = closest
    // console.log('Current object: ', this.current?.id ?? 'none')

    if (this.current) {
      //does the object require an item to open?
      if (this.current.unlockId) {
        const hasRequired = this.inventory.hasItem(this.current.unlockId) //true -> has item in inventory

        //player does not have item inside inventory
        if (!hasRequired) {
          const lockedText = this.current.lockedText ?? 'You cannot do this yet'

          this.promptTextObject.text = lockedText //make the promptText the lockedText we sent via main.ts
          this.redrawPromptBackground()
          this.promptContainer.position.set(characterPositionX - 50, characterPositionY - 120) //position the promptContainer on the character
          this.promptContainer.visible = true //make lockedText prompt visible when close to current object

          return
        }
      }

      // console.log(this.current.promptText)
      this.promptTextObject.text = this.current.promptText //make the promptText the one we sent via main.ts
      this.redrawPromptBackground()
      this.promptContainer.position.set(characterPositionX - 50, characterPositionY - 120) //position the promptContainer on the character
      this.promptContainer.visible = true //make it visible when close to current object
    } else {
      this.promptContainer.visible = false //make it not visible when moving away from object
    }

    //function to be able to interact with objects on key press
    const keyInteract = this.input.interact
    const justPressed = keyInteract && !this.prevInteract

    if (justPressed && this.current && this.current.onInteract) {
      //if the object require something to unlock it with
      if (this.current.unlockId && !this.inventory.hasItem(this.current.unlockId)) {
        return // block interaction
      }

      //else do the interaction
      this.current.onInteract()
    }

    this.prevInteract = keyInteract
  }

  //push the container to the top so that sprites don't go over the prompt = make the prompt not visible
  bringPromptToFront() {
    this.app.stage.addChild(this.promptContainer)
  }

  removeInteractable(id: string) {
    this.interactables = this.interactables.filter((item) => item.id !== id) //remove object from list of interactables

    //if the object you removed was active -> turn current to null
    if (this.current && this.current.id === id) {
      this.current = null
      this.promptContainer.visible = false
    }
  }

  clear() {
    this.interactables = []
    this.current = null
    this.promptContainer.visible = false
  }
}
