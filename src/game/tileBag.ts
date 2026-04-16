import type { TilePiece } from './types'
import { FRENCH_TILE_DISTRIBUTION } from './constants'

let idCounter = 0
const nextId = () => `t${++idCounter}`

export function createBag(): TilePiece[] {
  const bag: TilePiece[] = []
  for (const { letter, count, points } of FRENCH_TILE_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      bag.push({ id: nextId(), letter, points, isBlank: letter === ' ' })
    }
  }
  return shuffleBag(bag)
}

export function shuffleBag(bag: TilePiece[]): TilePiece[] {
  const arr = [...bag]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function drawTiles(bag: TilePiece[], n: number): [TilePiece[], TilePiece[]] {
  return [bag.slice(0, n), bag.slice(n)]
}