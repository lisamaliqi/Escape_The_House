import { Assets, Sprite } from 'pixi.js'

export type PaintingState = 'still' | 'withColorWheel' | 'moved'

export type PaintingPuzzle = {
  sprite: Sprite
  getPaintingState: () => PaintingState
  setPaintingState: (state: PaintingState) => void
}

export const createPaintingPuzzle = async (): Promise<PaintingPuzzle> => {
  const paintingSheet = await Assets.load(
    'room2/objects/paintingWithColorWheel/painting-with-colorWheel.json'
  )

  const paintingStill = paintingSheet.textures['{painting-with-colorWheel} 0.aseprite']
  const paintingWithColorWheel = paintingSheet.textures['{painting-with-colorWheel} 1.aseprite']
  const paintingMoved = paintingSheet.textures['{painting-with-colorWheel} 2.aseprite']

  const painting = new Sprite(paintingStill)

  painting.anchor.set(0.5)
  painting.x = 750
  painting.y = 120

  let paintingState: PaintingState = 'still'

  const getPaintingState = () => paintingState

  const setPaintingState = (state: PaintingState) => {
    paintingState = state
    if (state === 'still') painting.texture = paintingStill
    if (state === 'withColorWheel') painting.texture = paintingWithColorWheel
    if (state === 'moved') painting.texture = paintingMoved
  }

  setPaintingState('still')

  return {
    sprite: painting,
    getPaintingState,
    setPaintingState,
  }
}
