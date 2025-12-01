export class Input {
  up = false
  down = false
  left = false
  right = false
  interact = false

  // sets up event listeners to track key states
  constructor() {
    window.addEventListener('keydown', (e) => {
      if (this.isArrowKey(e.key)) e.preventDefault() //prevent scrolling with arrow keys
      this.set(e, true)
    })

    window.addEventListener('keyup', (e) => {
      if (this.isArrowKey(e.key)) e.preventDefault()
      this.set(e, false)
    })
  }

  //check if key is one of the arrow keys
  isArrowKey = (key: string) => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)
  }

  // set the key state
  set(e: KeyboardEvent, val: boolean) {
    const k = e.key.toLowerCase()

    if (['w', 'arrowup'].includes(k)) this.up = val
    if (['s', 'arrowdown'].includes(k)) this.down = val
    if (['a', 'arrowleft'].includes(k)) this.left = val
    if (['d', 'arrowright'].includes(k)) this.right = val
    if (k === 'e') this.interact = val
  }
}
