import type { PremiumType } from './types'

const LAYOUT_CODES: number[][] = [
  [4,0,0,1,0,0,0,4,0,0,0,1,0,0,4],
  [0,3,0,0,0,2,0,0,0,2,0,0,0,3,0],
  [0,0,3,0,0,0,1,0,1,0,0,0,3,0,0],
  [1,0,0,3,0,0,0,1,0,0,0,3,0,0,1],
  [0,0,0,0,3,0,0,0,0,0,3,0,0,0,0],
  [0,2,0,0,0,2,0,0,0,2,0,0,0,2,0],
  [0,0,1,0,0,0,1,0,1,0,0,0,1,0,0],
  [4,0,0,1,0,0,0,5,0,0,0,1,0,0,4],
  [0,0,1,0,0,0,1,0,1,0,0,0,1,0,0],
  [0,2,0,0,0,2,0,0,0,2,0,0,0,2,0],
  [0,0,0,0,3,0,0,0,0,0,3,0,0,0,0],
  [1,0,0,3,0,0,0,1,0,0,0,3,0,0,1],
  [0,0,3,0,0,0,1,0,1,0,0,0,3,0,0],
  [0,3,0,0,0,2,0,0,0,2,0,0,0,3,0],
  [4,0,0,1,0,0,0,4,0,0,0,1,0,0,4],
]

const CODE_TO_PREMIUM: Record<number, PremiumType> = {
  0: null, 1: 'DL', 2: 'TL', 3: 'DW', 4: 'TW', 5: 'CENTER',
}

export const BOARD_PREMIUMS: PremiumType[][] = LAYOUT_CODES.map((row) =>
  row.map((code) => CODE_TO_PREMIUM[code])
)

export const FRENCH_TILE_DISTRIBUTION: { letter: string; count: number; points: number }[] = [
  { letter: 'A', count: 9, points: 1 },
  { letter: 'B', count: 2, points: 3 },
  { letter: 'C', count: 2, points: 3 },
  { letter: 'D', count: 3, points: 2 },
  { letter: 'E', count: 15, points: 1 },
  { letter: 'F', count: 2, points: 4 },
  { letter: 'G', count: 2, points: 2 },
  { letter: 'H', count: 2, points: 4 },
  { letter: 'I', count: 8, points: 1 },
  { letter: 'J', count: 1, points: 8 },
  { letter: 'K', count: 1, points: 10 },
  { letter: 'L', count: 5, points: 1 },
  { letter: 'M', count: 3, points: 2 },
  { letter: 'N', count: 6, points: 1 },
  { letter: 'O', count: 6, points: 1 },
  { letter: 'P', count: 2, points: 3 },
  { letter: 'Q', count: 1, points: 8 },
  { letter: 'R', count: 6, points: 1 },
  { letter: 'S', count: 6, points: 1 },
  { letter: 'T', count: 6, points: 1 },
  { letter: 'U', count: 6, points: 1 },
  { letter: 'V', count: 2, points: 4 },
  { letter: 'W', count: 1, points: 10 },
  { letter: 'X', count: 1, points: 10 },
  { letter: 'Y', count: 1, points: 10 },
  { letter: 'Z', count: 1, points: 10 },
  { letter: ' ', count: 2, points: 0 },
]

export const BOARD_SIZE = 15
export const RACK_SIZE = 7
export const SCRABBLE_BONUS = 50