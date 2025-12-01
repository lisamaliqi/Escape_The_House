export class Inventory {
  private items: string[] = []

  //add item if it doesn't already exist
  addItem(id: string) {
    this.items.push(id)
    console.log('All items inside inventory: ', this.items)
  }
}
