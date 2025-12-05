import { Assets, Sprite } from 'pixi.js'

export type DrawerState = 'closed' | 'openWithNote' | 'opened'

export type DrawerPuzzle = {
  sprite: Sprite
  getDrawerState: () => DrawerState
  setDrawerState: (state: DrawerState) => void
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

  let drawerState: DrawerState = 'closed'

  const getDrawerState = () => drawerState

  const setDrawerState = (state: DrawerState) => {
    drawerState = state
    if (state === 'closed') drawer.texture = drawerClosed
    if (state === 'openWithNote') drawer.texture = drawerOpenWithNote
    if (state === 'opened') drawer.texture = drawerOpened
  }

  setDrawerState('closed')

  return {
    sprite: drawer,
    getDrawerState,
    setDrawerState,
  }
}
