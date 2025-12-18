import { Assets, Sprite } from 'pixi.js'

export type SafeState = 'closed' | 'half' | 'open'

export type SafePuzzle = {
  sprite: Sprite
  getSafeState: () => SafeState
  setSafeState: (state: SafeState) => void
  takeKey: () => void
  hasKey: () => boolean
}

type CodeModalOptions = {
  title?: string
  subtitle?: string
  validate?: (code: string) => boolean | Promise<boolean>
  successText?: string
  errorText?: string
}

export const openCodeModal = (opts?: CodeModalOptions): Promise<string | null> => {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'

    overlay.innerHTML = `
      <div class="modal">
        <button class="modal-close" aria-label="Close">✕</button>
        <h2 class="modal-title">${opts?.title ?? 'Enter code'}</h2>
        <p class="modal-subtitle">${opts?.subtitle ?? 'Type 6 digits'}</p>

        <div class="code-slots" aria-label="6 digit code">
          ${Array.from({ length: 6 })
            .map(() => `<span class="slot">-</span>`)
            .join('')}
        </div>

        <p class="modal-feedback" aria-live="polite"></p>

        <div class="modal-actions">
          <button class="btn secondary" data-cancel>Cancel</button>
          <button class="btn primary" data-ok disabled>OK</button>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    const modal = overlay.querySelector<HTMLDivElement>('.modal')!
    const slots = Array.from(overlay.querySelectorAll<HTMLSpanElement>('.slot'))
    const feedback = overlay.querySelector<HTMLParagraphElement>('.modal-feedback')!
    const okBtn = overlay.querySelector<HTMLButtonElement>('[data-ok]')!
    const cancelBtn = overlay.querySelector<HTMLButtonElement>('[data-cancel]')!
    const closeBtn = overlay.querySelector<HTMLButtonElement>('.modal-close')!

    let digits: string[] = []
    let busy = false

    const setBusy = (value: boolean) => {
      busy = value
      okBtn.disabled = value || digits.length !== 6
      cancelBtn.disabled = value
      closeBtn.disabled = value
    }

    const setFeedback = (type: 'none' | 'error' | 'success', text = '') => {
      feedback.textContent = text
      feedback.classList.remove('error', 'success')
      if (type === 'error') feedback.classList.add('error')
      if (type === 'success') feedback.classList.add('success')
    }

    const shake = () => {
      modal.classList.remove('shake')
      void modal.offsetWidth
      modal.classList.add('shake')
    }

    const render = () => {
      for (let i = 0; i < 6; i++) slots[i].textContent = digits[i] ?? '-'
      if (!busy) okBtn.disabled = digits.length !== 6
    }

    const cleanup = (value: string | null) => {
      window.removeEventListener('keydown', onKeyDown)
      overlay.remove()
      resolve(value)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (busy) return

      if (e.key === 'Escape') return cleanup(null)

      if (e.key === 'Backspace') {
        digits = digits.slice(0, -1)
        setFeedback('none')
        render()
        return
      }

      if (/^\d$/.test(e.key)) {
        if (digits.length < 6) {
          digits.push(e.key)
          setFeedback('none')
          render()
        }
        return
      }
    }

    const trySubmit = async () => {
      if (busy) return
      if (digits.length !== 6) return

      const code = digits.join('')

      if (!opts?.validate) return cleanup(code)

      setBusy(true)
      setFeedback('none')

      const isValid = await opts.validate(code)

      if (!isValid) {
        setFeedback('error', opts.errorText ?? 'Wrong code. Try again.')
        shake()
        digits = []
        render()
        setBusy(false)
        return
      }

      setFeedback('success', opts.successText ?? 'Unlocked!')
      setTimeout(() => cleanup(code), 450)
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && !busy) cleanup(null)
    })

    cancelBtn.addEventListener('click', () => !busy && cleanup(null))
    closeBtn.addEventListener('click', () => !busy && cleanup(null))
    okBtn.addEventListener('click', () => void trySubmit())

    window.addEventListener('keydown', onKeyDown)

    render()
  })
}

/**
 * Creates the safe puzzle:
 * - loads spritesheet
 * - handles open/close animation
 * - checks 6-digit code on open
 * - makes the sprite clickable (will remove later)
 */
export const createSafePuzzle = async (): Promise<SafePuzzle> => {
  //load spritesheet (animation) for safe object
  const safeSheet = await Assets.load('/room1/objects/safe/safe.json')

  const safeClosed = safeSheet.textures['{safe} 0.aseprite']
  const safeHalfWithKey = safeSheet.textures['{safe} 1.aseprite']
  const safeHalfNoKey = safeSheet.textures['{safe} 2.aseprite']
  const safeOpenWithKey = safeSheet.textures['{safe} 3.aseprite']
  const safeOpenNoKey = safeSheet.textures['{safe} 4.aseprite']

  const safe = new Sprite(safeClosed)

  //position the safe correctly in the room
  safe.anchor.set(0.5)
  safe.x = 190
  safe.y = 290
  safe.scale.set(2)

  // --- SAFE STATE / CODE LOGIC ---

  let safeState: SafeState = 'closed'
  let keyExists = true

  const getSafeState = () => safeState
  const hasKey = () => keyExists

  const setSafeState = (state: SafeState) => {
    safeState = state

    if (state === 'closed') safe.texture = safeClosed
    if (state === 'half') safe.texture = keyExists ? safeHalfWithKey : safeHalfNoKey
    if (state === 'open') safe.texture = keyExists ? safeOpenWithKey : safeOpenNoKey
  }

  const takeKey = () => {
    if (safeState !== 'open') return
    if (!keyExists) return

    keyExists = false
    setSafeState('open')
  }

  setSafeState('closed')

  return {
    sprite: safe,
    getSafeState,
    setSafeState,
    takeKey,
    hasKey,
  }
}
