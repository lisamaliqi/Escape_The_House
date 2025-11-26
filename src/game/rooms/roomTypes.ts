import type { Sprite } from 'pixi.js'

export interface Room {
  sprite: Sprite
  isWalkable: (x: number, y: number) => boolean
}
