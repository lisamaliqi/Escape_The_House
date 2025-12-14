import { Application, Assets, Sprite } from 'pixi.js'
import { openColorLockPixi, type ColorId } from './colorLockUI'

export type SinkCabinetState = 'closed' | 'opened'

export type SinkCabinetPuzzle = {
  sprite: Sprite
  getSinkCabinetState: () => SinkCabinetState
  setSinkCabinetState: (state: SinkCabinetState) => void
  tryUnlock: (picked: [ColorId, ColorId, ColorId]) => boolean
  openLock: () => Promise<boolean>
}

export const createSinkCabinetPuzzle = async (app: Application): Promise<SinkCabinetPuzzle> => {
  const sinkCabinetSheet = await Assets.load('room3/objects/sinkCabinet/sink-cabinet.json')

  const sinkCabinetClosed = sinkCabinetSheet.textures['{sink-cabinet} 0.aseprite']
  const sinkCabinetOpened = sinkCabinetSheet.textures['{sink-cabinet} 1.aseprite']

  const sinkCabinet = new Sprite(sinkCabinetClosed)

  sinkCabinet.anchor.set(0.5)
  sinkCabinet.x = 400
  sinkCabinet.y = 320

  let sinkCabinetState: SinkCabinetState = 'closed'

  const getSinkCabinetState = () => sinkCabinetState

  const setSinkCabinetState = (state: SinkCabinetState) => {
    sinkCabinetState = state
    if (state === 'closed') sinkCabinet.texture = sinkCabinetClosed
    if (state === 'opened') sinkCabinet.texture = sinkCabinetOpened
  }

  const solution: [ColorId, ColorId, ColorId] = ['orange', 'blue', 'yellow']

  const tryUnlock = (picked: [ColorId, ColorId, ColorId]) => {
    const correct =
      picked[0] === solution[0] && picked[1] === solution[1] && picked[2] === solution[2]

    if (correct) setSinkCabinetState('opened')

    return correct
  }

  const openLock = async () => {
    if (getSinkCabinetState() === 'opened') return true

    const colors: ColorId[] = [
      'purple',
      'white',
      'blue',
      'green',
      'orange',
      'pink',
      'red',
      'yellow',
    ]

    let wasCorrect = false

    const picked = await openColorLockPixi(app, {
      colors,
      slots: 3,
      validate: (p) => {
        const ok = tryUnlock(p)
        wasCorrect = ok
        return ok
      },
    })

    if (!picked) return false
    return wasCorrect
  }

  setSinkCabinetState('closed')

  return {
    sprite: sinkCabinet,
    getSinkCabinetState,
    setSinkCabinetState,
    tryUnlock,
    openLock,
  }
}
