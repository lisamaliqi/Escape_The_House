import { Assets, Sprite } from 'pixi.js'

export type SinkCabinetState = 'closed' | 'opened'

export type SinkCabinetPuzzle = {
  sprite: Sprite
}

export const createSinkCabinetPuzzle = async (): Promise<SinkCabinetPuzzle> => {
  const sinkCabinetSheet = await Assets.load('room3/objects/sinkCabinet/sink-cabinet.json')

  const sinkCabinetClosed = sinkCabinetSheet.textures['{sink-cabinet} 0.aseprite']
  const sinkCabinetOpened = sinkCabinetSheet.textures['{sink-cabinet} 1.aseprite']

  const sinkCabinet = new Sprite(sinkCabinetClosed)

  sinkCabinet.anchor.set(0.5)
  sinkCabinet.x = 400
  sinkCabinet.y = 320

  let sinkCabinetState: SinkCabinetState = 'closed'

  return {
    sprite: sinkCabinet,
  }
}
