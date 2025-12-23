// assets.ts
import { Assets } from 'pixi.js'

export async function preloadAssets() {
  Assets.addBundle('game', {
    //--CHARACTER--
    characterStill: '/character/characterStill/characterStill.png',
    characterDown: '/character/characterDown/characterDown.json',
    characterUp: '/character/characterUp/characterUp.json',
    characterLeft: '/character/characterLeft/characterLeft.json',
    characterRight: '/character/characterRight/characterRight.json',

    //--INVENTORY--
    blackKey: '/inventory/blackKey.png',
    colorWheel: '/inventory/colorWheel.png',
    note1: '/inventory/note1.png',
    note2: '/inventory/note2.png',
    redKey: '/inventory/redKey.png',
    shovel: '/inventory/shovel.png',

    //--ROOM 1--
    room1: '/room1/room1.png',
    room1_mask: '/room1/room1_mask.png',
    door1to2: '/room1/objects/door1-2/door1-2.json',
    plantDesk: '/room1/objects/plantDesk/blomkruka.json',
    safe: '/room1/objects/safe/safe.json',
    shovelInRoom: '/room1/objects/shovel/shovel.png',

    //--ROOM 2--
    room2: '/room2/room2.png',
    room2_mask: '/room2/room2_mask.png',
    door2to1: '/room2/objects/door2-1/door2-1.png',
    door2to3: '/room2/objects/door2-3/door2-3.json',
    drawer: '/room2/objects/drawer/drawer-with-note.json',
    outsideDoor: '/room2/objects/outsideDoor/outsideDoor.json',
    paintingWithColorWheel: '/room2/objects/paintingWithColorWheel/painting-with-colorWheel.json',

    //--ROOM 3--
    room3: '/room3/room3.png',
    room3_mask: '/room3/room3_mask.png',
    door3to2: '/room3/objects/door3-2/door3-2.png',
    sinkCabinet: '/room3/objects/sinkCabinet/sink-cabinet.json',
  })

  await Assets.loadBundle('game')
}
