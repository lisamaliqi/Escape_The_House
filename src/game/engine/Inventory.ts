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
    })
  }
}
