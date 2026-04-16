export type PremiumType = 'TW' | 'DW' | 'TL' | 'DL' | 'CENTER' | null

export interface TilePiece {
  id: string
  letter: string
  points: number
  isBlank: boolean
  blankLetter?: string
}

export interface BoardCell {
  row: number
  col: number
  tile: TilePiece | null
  premium: PremiumType
  isNew: boolean
}

export interface Player {
  id: 1 | 2
  name: string
  score: number
  rack: TilePiece[]
}

export type GamePhase = 'menu' | 'playing' | 'gameover'
export type RulesMode = 'classic' | 'casual'
export type GameMode = '2players' | 'vsAI'
export type AIDifficulty = 'easy' | 'normal' | 'hard'

export interface GameState {
  board: BoardCell[][]
  players: [Player, Player]
  currentPlayer: 0 | 1
  bag: TilePiece[]
  phase: GamePhase
  rulesMode: RulesMode
  gameMode: GameMode
  aiDifficulty: AIDifficulty
  consecutivePasses: number
  message: string
  placedThisTurn: { row: number; col: number }[]
  isFirstMove: boolean
}