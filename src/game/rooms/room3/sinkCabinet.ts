import { Application, Assets, Container, Graphics, Sprite, Text } from 'pixi.js'

export type SinkCabinetState = 'closed' | 'opened'

export type ColorId = 'purple' | 'white' | 'blue' | 'green' | 'orange' | 'pink' | 'red' | 'yellow'

export type SinkCabinetPuzzle = {
  sprite: Sprite
  getSinkCabinetState: () => SinkCabinetState
  setSinkCabinetState: (state: SinkCabinetState) => void
  tryUnlock: (picked: [ColorId, ColorId, ColorId]) => boolean
  openLock: () => Promise<boolean>
}

const COLOR_HEX: Record<ColorId, number> = {
  purple: 0x3d395a,
  white: 0xffffff,
  blue: 0x2204ff,
  green: 0x4b692f,
  orange: 0xdf7126,
  pink: 0xff8994,
  red: 0x621f1f,
  yellow: 0xfbf236,
}

// ✅ Liten intern UI-funktion i samma fil
const openColorLockPixi = (
  app: Application,
  colors: ColorId[],
  slots = 3
): Promise<[ColorId, ColorId, ColorId] | null> => {
  return new Promise((resolve) => {
    const picked: ColorId[] = []

    const root = new Container()
    root.eventMode = 'static'
    root.hitArea = app.screen
    root.zIndex = 9999

    // bakgrund
    root.addChild(
      new Graphics()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: 0x000000, alpha: 0.6 })
    )

    // panel
    const w = 520,
      h = 260
    const px = (app.screen.width - w) / 2
    const py = (app.screen.height - h) / 2

    root.addChild(
      new Graphics()
        .roundRect(px, py, w, h, 16)
        .fill(0x111111)
        .stroke({ color: 0x333333, width: 2 })
    )

    const title = new Text({ text: 'Choose colors', style: { fill: 0xffffff, fontSize: 20 } })
    title.position.set(px + 16, py + 12)
    root.addChild(title)

    // slots (3 rutor som fylls)
    const slotBoxes: Graphics[] = []
    for (let i = 0; i < slots; i++) {
      const box = new Graphics().roundRect(px + 16 + i * 44, py + 48, 36, 36, 8).fill(0x1b1b1b)
      slotBoxes.push(box)
      root.addChild(box)
    }

    const redrawSlots = () => {
      for (let i = 0; i < slots; i++) {
        const c = picked[i]
        const g = slotBoxes[i]
        g.clear()
        g.roundRect(px + 16 + i * 44, py + 48, 36, 36, 8)
          .fill(c ? COLOR_HEX[c] : 0x1b1b1b)
          .stroke({ color: 0x444444, width: 2 })
      }
    }

    // knappar (8 färger)
    const startX = px + 16
    const startY = py + 100
    const size = 44
    const gap = 12
    const cols = 4

    colors.forEach((colorId, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * (size + gap)
      const y = startY + row * (size + gap)

      const btn = new Graphics()
        .roundRect(x, y, size, size, 10)
        .fill(COLOR_HEX[colorId])
        .stroke({ color: 0x666666, width: 2 })

      btn.eventMode = 'static'
      btn.cursor = 'pointer'
      btn.on('pointerdown', () => {
        if (picked.length >= slots) return
        picked.push(colorId)
        redrawSlots()

        if (picked.length === slots) {
          cleanup()
          resolve(picked as [ColorId, ColorId, ColorId])
        }
      })

      root.addChild(btn)
    })

    // avbryt
    const cancelBtn = new Graphics()
      .roundRect(px + w - 120, py + h - 52, 104, 36, 10)
      .fill(0x222222)
      .stroke({ color: 0x444444, width: 2 })
    cancelBtn.eventMode = 'static'
    cancelBtn.cursor = 'pointer'
    cancelBtn.on('pointerdown', () => {
      cleanup()
      resolve(null)
    })
    root.addChild(cancelBtn)

    const cancelText = new Text({ text: 'Cancel', style: { fill: 0xffffff, fontSize: 14 } })
    cancelText.position.set(px + w - 120 + 26, py + h - 52 + 9)
    root.addChild(cancelText)

    app.stage.sortableChildren = true
    app.stage.addChild(root)
    redrawSlots()

    const cleanup = () => {
      app.stage.removeChild(root)
      root.destroy({ children: true })
    }
  })
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
    const picked = await openColorLockPixi(app, colors, 3)
    if (!picked) return false

    return tryUnlock(picked)
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
