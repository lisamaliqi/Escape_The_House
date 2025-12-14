import { Application, Container, Graphics, Text } from 'pixi.js'

export type ColorId = 'purple' | 'white' | 'blue' | 'green' | 'orange' | 'pink' | 'red' | 'yellow'

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

export const openColorLockPixi = (
  app: Application,
  opts: {
    colors: ColorId[]
    slots?: number
    validate: (picked: [ColorId, ColorId, ColorId]) => boolean
  }
): Promise<[ColorId, ColorId, ColorId] | null> => {
  const slots = opts.slots ?? 3

  return new Promise((resolve) => {
    const picked: ColorId[] = []
    let locked = false

    const root = new Container()
    root.eventMode = 'static'
    root.hitArea = app.screen
    root.zIndex = 9999

    root.addChild(
      new Graphics()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: 0x000000, alpha: 0.6 })
    )

    const w = 520
    const h = 280
    const px = (app.screen.width - w) / 2
    const py = (app.screen.height - h) / 2

    root.addChild(
      new Graphics()
        .roundRect(px, py, w, h, 16)
        .fill(0x111111)
        .stroke({ color: 0x333333, width: 2 })
    )

    const title = new Text({ text: 'Choose 3 colors', style: { fill: 0xffffff, fontSize: 20 } })
    title.position.set(px + 16, py + 12)
    root.addChild(title)

    const hint = new Text({
      text: 'Hint: Use the rooms and the color wheel to find the right order.',
      style: { fill: 0xffffff, fontSize: 14, wordWrap: true, wordWrapWidth: w - 32 },
    })
    hint.position.set(px + 16, py + 40)
    root.addChild(hint)

    const feedback = new Text({ text: '', style: { fill: 0xffffff, fontSize: 14 } })
    feedback.position.set(px + 16, py + 72)
    root.addChild(feedback)

    const slotBoxes: Graphics[] = []
    for (let i = 0; i < slots; i++) {
      const box = new Graphics()
      slotBoxes.push(box)
      root.addChild(box)
    }

    const redrawSlots = () => {
      for (let i = 0; i < slots; i++) {
        const c = picked[i]
        const g = slotBoxes[i]
        g.clear()
        g.roundRect(px + 16 + i * 44, py + 100, 36, 36, 8)
          .fill(c ? COLOR_HEX[c] : 0x1b1b1b)
          .stroke({ color: 0x444444, width: 2 })
      }
    }

    const startX = px + 16
    const startY = py + 150
    const size = 44
    const gap = 12
    const cols = 4

    const buttons: Graphics[] = []

    const cleanup = () => {
      app.stage.removeChild(root)
      root.destroy({ children: true })
    }

    const resetTry = () => {
      picked.length = 0
      feedback.text = '✖ Wrong combination. Try again.'
      ;(feedback.style as any).fill = 0xff3b30
      redrawSlots()
    }

    const successAndClose = (finalPick: [ColorId, ColorId, ColorId]) => {
      locked = true
      feedback.text = '✔ Correct combination!'
      ;(feedback.style as any).fill = 0x34c759

      buttons.forEach((b) => (b.eventMode = 'none'))

      setTimeout(() => {
        cleanup()
        resolve(finalPick)
      }, 700)
    }

    opts.colors.forEach((colorId, i) => {
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
        if (locked) return
        if (picked.length >= slots) return

        feedback.text = ''
        picked.push(colorId)
        redrawSlots()

        if (picked.length === slots) {
          const finalPick = picked as [ColorId, ColorId, ColorId]
          const ok = opts.validate(finalPick)
          if (ok) successAndClose(finalPick)
          else resetTry()
        }
      })

      buttons.push(btn)
      root.addChild(btn)
    })

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
    cancelText.position.set(px + w - 120 + 28, py + h - 52 + 9)
    root.addChild(cancelText)

    app.stage.sortableChildren = true
    app.stage.addChild(root)
    redrawSlots()
  })
}
