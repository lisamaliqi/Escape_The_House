import { Assets, Sprite } from 'pixi.js'

export type DrawerPuzzle = {
  sprite: Sprite
}
export const createDrawerPuzzle = async (): Promise<DrawerPuzzle> => {
  const drawerSheet = await Assets.load('/room2/objects/drawer/drawer-with-note.json')

  const drawerClosed = drawerSheet.textures['{drawer-with-note} 0.aseprite']
  const drawerOpenWithNote = drawerSheet.textures['{drawer-with-note} 1.aseprite']
  const drawerOpened = drawerSheet.textures['{drawer-with-note} 2.aseprite']

  const drawer = new Sprite(drawerClosed)

  drawer.anchor.set(0.5)
  drawer.x = 470
  drawer.y = 205

  return {
    sprite: drawer,
  }
}
