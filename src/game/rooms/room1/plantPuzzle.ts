import { Assets, Sprite } from 'pixi.js'

export type PlantState = 'alive' | 'dead'

export type PlantPuzzle = {
  sprite: Sprite
  dig: () => void
}

/**
 * Creates the plant puzzle:
 * - loads spritesheet
 * - handles dig animation (will be executed only once)
 */

export const createPlantPuzzle = async (): Promise<PlantPuzzle> => {
  //load spritesheet (animation) for plant object
  const plantSheet = await Assets.load('/room1/objects/plantDesk/blomkruka.json')

  const plantAlive = plantSheet.textures['{blomkruka} 0.aseprite']
  const plantDead = plantSheet.textures['{blomkruka} 1.aseprite']

  const plant = new Sprite(plantAlive)

  plant.anchor.set(0.5)
  plant.x = 800
  plant.y = 360
  plant.scale.set(2)

  let plantState: PlantState = 'alive'

  const setPlantState = (state: PlantState) => {
    plantState = state
    if (state === 'alive') plant.texture = plantAlive
    if (state === 'dead') plant.texture = plantDead
  }

  setPlantState('alive')

  const dig = () => {
    console.log('currently digging!')
  }

  return {
    sprite: plant,
    dig,
  }
}
