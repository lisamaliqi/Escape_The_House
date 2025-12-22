import type { CodeModalOptions } from './types'

/**
 * Opens a modal dialog to input a 6-digit code.
 */
export const openCodeModal = (opts?: CodeModalOptions): Promise<string | null> => {
  return new Promise((resolve) => {
    //create modal overlay and give class name with styling
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'

    //HTML structure for the modal
    overlay.innerHTML = `
      <div class="modal">
        <button class="modal-close" aria-label="Close">✕</button>
        <h2 class="modal-title">'Safe code'</h2>
        <p class="modal-subtitle">'Enter the 6-digit code'}</p>

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

    //append it to the body
    document.body.appendChild(overlay)

    const modal = overlay.querySelector<HTMLDivElement>('.modal')!
    const slots = Array.from(overlay.querySelectorAll<HTMLSpanElement>('.slot'))
    const feedback = overlay.querySelector<HTMLParagraphElement>('.modal-feedback')!
    const okBtn = overlay.querySelector<HTMLButtonElement>('[data-ok]')!
    const cancelBtn = overlay.querySelector<HTMLButtonElement>('[data-cancel]')!
    const closeBtn = overlay.querySelector<HTMLButtonElement>('.modal-close')!

    let digits: string[] = []
    let busy = false

    //sets the busy state of the modal (disables buttons and input)
    const setBusy = (value: boolean) => {
      busy = value
      okBtn.disabled = value || digits.length !== 6
      cancelBtn.disabled = value
      closeBtn.disabled = value
    }

    //sets feedback message and style (error or success or none for the code)
    const setFeedback = (type: 'none' | 'error' | 'success', text = '') => {
      feedback.textContent = text
      feedback.classList.remove('error', 'success')
      if (type === 'error') feedback.classList.add('error')
      if (type === 'success') feedback.classList.add('success')
    }

    //if error, it shakes the modal (css animation)
    const shake = () => {
      modal.classList.remove('shake')
      void modal.offsetWidth
      modal.classList.add('shake')
    }

    //render current digits in the slots, UI update
    const render = () => {
      for (let i = 0; i < 6; i++) {
        slots[i].textContent = digits[i] ?? '-'
      }

      if (!busy) okBtn.disabled = digits.length !== 6
    }

    //cleanup modal and resolve promise
    const cleanup = (value: string | null) => {
      window.removeEventListener('keydown', onKeyDown)
      overlay.remove()
      resolve(value)
    }

    //handles keydown events for input
    const onKeyDown = (e: KeyboardEvent) => {
      if (busy) return
      if (e.key === 'Escape') return cleanup(null) // close on escape

      if (e.key === 'Backspace') {
        // remove last digit
        digits = digits.slice(0, -1)
        setFeedback('none')
        render()
        return
      }

      if (/^\d$/.test(e.key)) {
        // add digit if it's a number
        if (digits.length < 6) {
          digits.push(e.key)
          setFeedback('none')
          render()
        }
      }
    }

    //tries to submit the code for validation
    const trySubmit = async () => {
      if (busy) return
      if (digits.length !== 6) return

      const code = digits.join('')

      if (!opts?.validate) return cleanup(code)

      setBusy(true)
      setFeedback('none')

      const isValid = await opts.validate(code)

      //not correct code
      if (!isValid) {
        setFeedback('error', 'Wrong code. Try again.')
        shake()
        digits = []
        render()
        setBusy(false)
        return
      }

      //correct code
      setFeedback('success', 'Unlocked!')
      setTimeout(() => cleanup(code), 450)
    }

    //click outside modal = close modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && !busy) cleanup(null)
    })

    cancelBtn.addEventListener('click', () => !busy && cleanup(null)) //close
    closeBtn.addEventListener('click', () => !busy && cleanup(null)) //close
    okBtn.addEventListener('click', () => void trySubmit()) //submit

    window.addEventListener('keydown', onKeyDown)
    render()
  })
}
