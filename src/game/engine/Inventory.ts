export class Inventory {
  private items: string[] = []
  private container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
  }

  //add item if it doesn't already exist
  addItem(id: string) {
    if (this.items.includes(id)) return

    this.items.push(id)
    console.log('All items inside inventory: ', this.items)
    this.render()
  }

  //check if the item exist inside the inventory
  hasItem(id: string): boolean {
    return this.items.includes(id)
  }

  //show big-screen of inventory item
  private openPreview(itemId: string) {
    //remove old overlay if there is any
    const existing = document.getElementById('inventory-overlay')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'inventory-overlay'

    const box = document.createElement('div')
    box.className = 'inventory-overlay-box'

    const img = document.createElement('img')
    img.src = `/inventory/${itemId}.png`
    img.alt = itemId

    const closeBtn = document.createElement('button')
    closeBtn.textContent = 'Close'
    closeBtn.className = 'inventory-overlay-close'

    closeBtn.addEventListener('click', () => overlay.remove())

    //can also close if clicking outside modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove()
    })

    box.appendChild(img)
    box.appendChild(closeBtn)
    overlay.appendChild(box)
    document.body.appendChild(overlay)
  }

  //draw inventory-bar inside DOM
  private render() {
    //empty it
    this.container.innerHTML = ''

    this.items.forEach((itemId) => {
      const img = document.createElement('img')

      img.src = `/inventory/${itemId}.png`
      img.alt = itemId
      img.className = 'inventory-item'
      this.container.appendChild(img)

      //add click to make inventory item bigger when pressing item
      img.addEventListener('click', () => {
        this.openPreview(itemId)
      })
    })
  }
}
