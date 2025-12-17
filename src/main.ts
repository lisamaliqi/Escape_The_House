import './style/main.scss'
import { Application } from 'pixi.js'
import { Character } from './game/character/Character'
import { Input } from './game/engine/Input'
import { InteractionSystem } from './game/engine/InteractionSystem'
import { Inventory } from './game/engine/Inventory'
import { registerRoom1Interactables } from './game/rooms/room1/Interactables'
import { Room1, type Room1State } from './game/rooms/room1/Room1'
import { registerRoom2Interactables } from './game/rooms/room2/Interactables'
import { Room2, type Room2State } from './game/rooms/room2/Room2'
import { registerRoom3Interactables } from './game/rooms/room3/Interactables'
import { Room3, type Room3State } from './game/rooms/room3/Room3'

let appRef: Application | null = null
let gameWrapperRef: HTMLDivElement | null = null

let soundEnabled = true
let bgMusic: HTMLAudioElement | null = null

const playBackgroundMusic = () => {
  if (bgMusic) return

  bgMusic = new Audio('/audio/backgroundMusic.mp3')
  bgMusic.loop = true
  bgMusic.volume = 0.4

  if (soundEnabled) bgMusic.play()
}

const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled

  if (!bgMusic) return

  if (soundEnabled) {
    bgMusic.play()
  } else {
    bgMusic.pause()
  }
}

const stopBackgroundMusic = () => {
  bgMusic?.pause()
  bgMusic = null
}

const STORY_MS = 1000

const createStartScreen = (onStart: () => void) => {
  const wrapper = document.createElement('div')
  wrapper.id = 'start-screen'

  wrapper.innerHTML = `
    <div class="start-box">
      <h1>Escape the House</h1>

      <div class="instructions">
        <p><strong>How to play</strong></p>
        <p>W A S D or ↑ ↓ ← → ––– Walk</p>
        <p>E ––– Interact</p>
        <p>Klick on Inventory item to make it bigger</p>
      </div>

      <button id="start-btn">Start game</button>
    </div>
  `

  const button = wrapper.querySelector('#start-btn') as HTMLButtonElement

  button.onclick = () => {
    wrapper.remove()
    onStart()
  }

  document.body.appendChild(wrapper)
}

const createStoryScreen = (ms: number, onDone: () => void) => {
  const wrapper = document.createElement('div')
  wrapper.id = 'story-screen'

  wrapper.innerHTML = `
    <div class="story-box">
      <h1>Escape the House</h1>
      <p>You woke up alone. You need to get out. Something is wrong...</p>
      <p><em>Find the clues and GET OUT.</em></p>
    </div>
  `

  document.body.appendChild(wrapper)

  window.setTimeout(() => {
    wrapper.remove()
    onDone()
  }, ms)
}

createStartScreen(() => {
  playBackgroundMusic()

  createStoryScreen(STORY_MS, () => {
    startGame()
  })
})

const quitGame = () => {
  bgMusic?.pause()
  bgMusic = null

  appRef?.destroy(true)
  appRef = null

  gameWrapperRef?.remove()
  gameWrapperRef = null

  createStartScreen(() => {
    createStoryScreen(STORY_MS, () => {
      playBackgroundMusic()
      startGame()
    })
  })
}

const createSettingsUI = (parent: HTMLElement) => {
  // Settings-button
  const btn = document.createElement('button')
  btn.id = 'settings-btn'
  btn.textContent = 'Settings'

  // Modal
  const modal = document.createElement('div')
  modal.id = 'settings-modal'
  modal.classList.add('hidden')

  const howToPlayHtml = `
    <p>W A S D or ↑ ↓ ← → ––– Walk</p>
    <p>E ––– Interact</p>
    <p>Click on inventory item to make it bigger</p>
  `

  modal.innerHTML = `
  <div class="settings-box">
    <div class="settings-header">
      <h2>Settings</h2>
      <button id="settings-close-x" aria-label="Close">✕</button>
    </div>

    <div class="settings-section">
      <div class="settings-row">
        <div class="settings-row-left">
          <p class="settings-label">Sound</p>
          <p class="settings-sub">Music & effects</p>
        </div>

        <label class="toggle">
          <input type="checkbox" id="sound-toggle" />
          <span class="toggle-track" aria-hidden="true"></span>
        </label>
      </div>
    </div>

    <div class="settings-section">
      <button id="how-to-play-btn" class="btn btn-secondary">How to play</button>

      <div id="how-to-play-panel" class="howto hidden">
        ${howToPlayHtml}
      </div>
    </div>

    <div class="settings-footer">
      <button id="quit-btn" class="btn btn-danger">Quit game</button>
    </div>
  </div>
`

  parent.appendChild(btn)
  parent.appendChild(modal)

  const soundToggle = modal.querySelector('#sound-toggle') as HTMLInputElement
  const howToPlayBtn = modal.querySelector('#how-to-play-btn') as HTMLButtonElement
  const quitBtn = modal.querySelector('#quit-btn') as HTMLButtonElement
  const closeBtn = modal.querySelector('#settings-close-x') as HTMLButtonElement
  const howPanel = modal.querySelector('#how-to-play-panel') as HTMLDivElement

  // init state
  soundToggle.checked = soundEnabled

  const open = () => modal.classList.remove('hidden')
  const close = () => {
    modal.classList.add('hidden')
    howPanel.classList.add('hidden')
  }

  btn.onclick = open
  closeBtn.onclick = close

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close()
  })

  soundToggle.onchange = () => setSoundEnabled(soundToggle.checked)

  howToPlayBtn.onclick = () => {
    howPanel.classList.toggle('hidden')
  }

  quitBtn.onclick = () => {
    modal.classList.add('hidden')
    quitGame()
  }
}

const startGame = async () => {
  //create wrapper for game
  const wrapper = document.createElement('div')
  wrapper.id = 'game-wrapper'
  document.body.appendChild(wrapper)

  gameWrapperRef = wrapper

  createSettingsUI(wrapper)

  const winScreen = document.getElementById('win-screen') as HTMLDivElement
  const playAgainBtn = document.getElementById('play-again') as HTMLButtonElement

  const showWinScreen = () => {
    wrapper.classList.add('hidden')
    winScreen.style.display = ''
    winScreen.classList.remove('hidden')
    stopBackgroundMusic()
  }

  playAgainBtn.addEventListener('click', () => {
    window.location.reload()
  })

  //initialize app
  const app = new Application()
  await app.init({
    width: 1200, //choose width and hight of canvas
    height: 700,
  })
  appRef = app

  //put canvas on the page
  wrapper.appendChild(app.canvas)

  // --- Inventory ---
  const inventoryContainer = document.createElement('div')
  inventoryContainer.id = 'inventory-bar'
  wrapper.appendChild(inventoryContainer)

  const inventory = new Inventory(inventoryContainer)

  const input = new Input() //init input handler (keys)
  const room1 = await Room1(app) //create room1
  const room2 = await Room2(app) //create room2
  const room3 = await Room3(app) //create room2
  const character = new Character(app, input, room1) //create character

  const room1State: Room1State = {
    door1to2Unlocked: false,
    shovelCollected: false,
    plantDig: false,
    key1Collected: false,
    safeUnlocked: false,
    blackKeyCollected: false,
  }

  const room2State: Room2State = {
    noteInDrawerCollected: false,
    colorWheelCollected: false,
    door2to3Opened: false,
    outsideDoorOpened: false,
  }

  const room3State: Room3State = {
    noteInCabinetCollected: false,
  }

  //add room
  app.stage.addChild(room1.sprite)

  //add objects behind character
  app.stage.addChild(room1.safePuzzle.sprite)
  app.stage.addChild(room1.shovel)
  app.stage.addChild(room1.door)

  //add character
  app.stage.addChild(character.sprite)

  //add objects in front of character
  app.stage.addChild(room1.plant)

  // --- InteractionSystem ---
  const interactionSystem = new InteractionSystem(
    app,
    input,
    () => ({
      // players "feet"
      x: character.sprite.x,
      y: character.sprite.y + 50, // same offset as the character
    }),
    inventory
  )

  //put all the logic for going to room 2 from room
  const useDoor1to2 = () => {
    //remove all room1 sprites
    app.stage.removeChild(room1.sprite)
    app.stage.removeChild(room1.safePuzzle.sprite)
    app.stage.removeChild(room1.shovel)
    app.stage.removeChild(room1.door)
    app.stage.removeChild(room1.plant)

    //add room2 sprites
    app.stage.addChild(room2.sprite)
    app.stage.addChild(room2.door)
    app.stage.addChild(room2.door2)
    app.stage.addChild(room2.drawer.sprite)
    app.stage.addChild(room2.painting.sprite)

    //add character
    app.stage.addChild(character.sprite)
    character.setRoom(room2)

    app.stage.addChild(room2.outsideDoor)

    //push prompt to the front
    interactionSystem.bringPromptToFront()

    //delete old interactables
    interactionSystem.clear()

    //register room2 interactables
    registerRoom2Interactables(
      interactionSystem,
      room2,
      inventory,
      useDoor2to1,
      useDoor2to3,
      room2State,
      showWinScreen
    )

    //position character by the door
    character.sprite.x = room2.door.x + 20
    character.sprite.y = room2.door.y + 20
  }

  const useDoor2to1 = () => {
    //remove all room2 sprites
    app.stage.removeChild(room2.sprite)
    app.stage.removeChild(room2.door)
    app.stage.removeChild(room2.door2)
    app.stage.removeChild(room2.drawer.sprite)
    app.stage.removeChild(room2.drawer.sprite)
    app.stage.removeChild(room2.painting.sprite)

    //add room1 sprites
    app.stage.addChild(room1.sprite)
    app.stage.addChild(room1.safePuzzle.sprite)
    if (!room1State.shovelCollected) app.stage.addChild(room1.shovel)
    app.stage.addChild(room1.door)

    //add character
    app.stage.addChild(character.sprite)
    character.setRoom(room1)

    app.stage.addChild(room1.plant)

    //push prompt to the front
    interactionSystem.bringPromptToFront()

    //delete old interactables
    interactionSystem.clear()

    //register room1 interactables
    registerRoom1Interactables(interactionSystem, room1, inventory, app, useDoor1to2, room1State)

    //position character by the door
    character.sprite.x = room1.door.x + 60
    character.sprite.y = room1.door.y + 20
  }

  const useDoor2to3 = () => {
    //remove all room2 sprites
    app.stage.removeChild(room2.sprite)
    app.stage.removeChild(room2.door)
    app.stage.removeChild(room2.door2)
    app.stage.removeChild(room2.drawer.sprite)
    app.stage.removeChild(room2.drawer.sprite)
    app.stage.removeChild(room2.painting.sprite)
    app.stage.removeChild(room2.outsideDoor)

    //add room3 sprites
    app.stage.addChild(room3.sprite)
    app.stage.addChild(room3.door)

    app.stage.addChild(character.sprite)
    character.setRoom(room3)

    app.stage.addChild(room3.sinkCabinetPuzzle.sprite)

    //push prompt to the front
    interactionSystem.bringPromptToFront()

    //delete old interactables
    interactionSystem.clear()

    //register room3 interactables
    registerRoom3Interactables(interactionSystem, room3, inventory, useDoor3to2, room3State)

    //position character by the door
    character.sprite.x = room3.door.x + 20
    character.sprite.y = room3.door.y + 20
  }

  const useDoor3to2 = () => {
    //remove room3 sprites
    app.stage.removeChild(room3.sprite)
    app.stage.removeChild(room3.door)
    app.stage.removeChild(room3.sinkCabinetPuzzle.sprite)

    //add room2 sprites
    app.stage.addChild(room2.sprite)
    app.stage.addChild(room2.door)
    app.stage.addChild(room2.door2)
    app.stage.addChild(room2.drawer.sprite)
    app.stage.addChild(room2.drawer.sprite)
    app.stage.addChild(room2.painting.sprite)

    app.stage.addChild(character.sprite)
    character.setRoom(room2)

    app.stage.addChild(room2.outsideDoor)

    //push prompt to the front
    interactionSystem.bringPromptToFront()

    //delete old interactables
    interactionSystem.clear()

    //register room2 interactables
    registerRoom2Interactables(
      interactionSystem,
      room2,
      inventory,
      useDoor2to1,
      useDoor2to3,
      room2State,
      showWinScreen
    )

    //position character by the door
    character.sprite.x = room2.door2.x + 60
    character.sprite.y = room2.door2.y + 20
  }

  registerRoom1Interactables(interactionSystem, room1, inventory, app, useDoor1to2, room1State)
}
