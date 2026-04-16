import type { GameState, TilePiece, RulesMode } from './types'
import type { BoardCell } from './types'
import { BOARD_SIZE } from './constants'
import { validatePlacement, getFormedWords, calculateScore, validateWords } from './gameLogic'
import type { PlacedCell } from './gameLogic'
import { getAIWordList } from './dictionary'

export interface AIMove {
  placements: { row: number; col: number; tile: TilePiece }[]
  score: number
  words: string[]
}

type Direction = 'H' | 'V'

function cloneBoard(board: BoardCell[][]): BoardCell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })))
}

function getLinesToCheck(board: BoardCell[][], direction: Direction): number[] {
  const lines = new Set<number>()
  for (let lineIdx = 0; lineIdx < BOARD_SIZE; lineIdx++) {
    for (let pos = 0; pos < BOARD_SIZE; pos++) {
      const [r, c] = direction === 'H' ? [lineIdx, pos] : [pos, lineIdx]
      if (board[r][c].tile) {
        lines.add(lineIdx)
        if (lineIdx > 0) lines.add(lineIdx - 1)
        if (lineIdx < BOARD_SIZE - 1) lines.add(lineIdx + 1)
        break
      }
    }
  }
  return [...lines]
}

function matchRackTiles(rack: TilePiece[], word: string, boardPositions: Set<number>): TilePiece[] | null {
  const remaining = [...rack]
  const result: TilePiece[] = []
  for (let i = 0; i < word.length; i++) {
    if (boardPositions.has(i)) continue
    const letter = word[i]
    const idx = remaining.findIndex((t) => !t.isBlank && t.letter === letter)
    if (idx !== -1) { result.push(remaining[idx]); remaining.splice(idx, 1) }
    else {
      const blankIdx = remaining.findIndex((t) => t.isBlank)
      if (blankIdx !== -1) { result.push({ ...remaining[blankIdx], blankLetter: letter, points: 0 }); remaining.splice(blankIdx, 1) }
      else return null
    }
  }
  return result
}

function tryPlacement(board: BoardCell[][], rack: TilePiece[], word: string, start: number, lineIdx: number, direction: Direction, isFirstMove: boolean, rulesMode: RulesMode): AIMove | null {
  const wordLen = word.length
  const boardPositions = new Set<number>()

  for (let i = 0; i < wordLen; i++) {
    const [r, c] = direction === 'H' ? [lineIdx, start + i] : [start + i, lineIdx]
    const cell = board[r][c]
    if (cell.tile) {
      const bl = cell.tile.isBlank ? (cell.tile.blankLetter ?? '') : cell.tile.letter
      if (bl !== word[i]) return null
      boardPositions.add(i)
    }
  }

  if (boardPositions.size === wordLen) return null

  if (start > 0) {
    const [r, c] = direction === 'H' ? [lineIdx, start - 1] : [start - 1, lineIdx]
    if (board[r][c].tile) return null
  }
  if (start + wordLen < BOARD_SIZE) {
    const [r, c] = direction === 'H' ? [lineIdx, start + wordLen] : [start + wordLen, lineIdx]
    if (board[r][c].tile) return null
  }

  const tiles = matchRackTiles(rack, word, boardPositions)
  if (!tiles) return null

  const tempBoard = cloneBoard(board)
  const placed: PlacedCell[] = []
  const placements: { row: number; col: number; tile: TilePiece }[] = []
  let tileIdx = 0

  for (let i = 0; i < wordLen; i++) {
    if (boardPositions.has(i)) continue
    const [r, c] = direction === 'H' ? [lineIdx, start + i] : [start + i, lineIdx]
    const tile = tiles[tileIdx++]
    tempBoard[r][c] = { ...tempBoard[r][c], tile, isNew: true }
    placed.push({ row: r, col: c })
    placements.push({ row: r, col: c, tile })
  }

  const validation = validatePlacement(tempBoard, placed, isFirstMove)
  if (!validation.valid) return null

  const formed = getFormedWords(tempBoard, placed)
  if (formed.length === 0) return null

  // Valide les mots — toujours (Détente et Classique exigent des vrais mots)
  const { valid } = validateWords(formed)
  if (!valid) return null

  const score = calculateScore(formed, placed, rulesMode)
  if (score === 0) return null

  return { placements, score, words: formed.map((f) => f.word) }
}

export type AIAction = { type: 'move'; move: AIMove } | { type: 'exchange'; count: number } | { type: 'pass' }

export function decideAIAction(state: GameState): AIAction {
  const move = findBestAIMove(state)
  if (move) return { type: 'move', move }
  const rack = state.players[state.currentPlayer].rack
  if (state.bag.length >= rack.length) return { type: 'exchange', count: rack.length }
  return { type: 'pass' }
}

export function findBestAIMove(state: GameState): AIMove | null {
  const { board, players, currentPlayer, isFirstMove, rulesMode, aiDifficulty } = state
  const rack = players[currentPlayer].rack
  if (rack.length === 0) return null

  const wordList = getAIWordList()
  const allMoves: AIMove[] = []
  const deadline = Date.now() + 4000

  for (const direction of ['H', 'V'] as Direction[]) {
    const lines = isFirstMove ? [7] : getLinesToCheck(board, direction)
    for (const lineIdx of lines) {
      for (const word of wordList) {
        if (Date.now() > deadline) break
        for (let start = 0; start <= BOARD_SIZE - word.length; start++) {
          const move = tryPlacement(board, rack, word, start, lineIdx, direction, isFirstMove, rulesMode)
          if (move) allMoves.push(move)
        }
      }
    }
  }

  if (allMoves.length === 0) return null
  allMoves.sort((a, b) => b.score - a.score)

  if (aiDifficulty === 'hard') return allMoves[0]
  if (aiDifficulty === 'normal') {
    const pool = allMoves.slice(0, Math.min(5, allMoves.length))
    return pool[Math.floor(Math.random() * pool.length)]
  }
  return allMoves[Math.floor(Math.random() * allMoves.length)]
}