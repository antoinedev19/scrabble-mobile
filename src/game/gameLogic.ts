import type { BoardCell, RulesMode } from './types'
import { BOARD_SIZE, SCRABBLE_BONUS } from './constants'
import { isValidWord } from './dictionary'

export type PlacedCell = { row: number; col: number }

export type PlacementResult = { valid: true } | { valid: false; error: string }

export function validatePlacement(board: BoardCell[][], placed: PlacedCell[], isFirstMove: boolean): PlacementResult {
  if (placed.length === 0) return { valid: false, error: 'Aucune tuile posée.' }

  const rows = new Set(placed.map((c) => c.row))
  const cols = new Set(placed.map((c) => c.col))
  if (rows.size > 1 && cols.size > 1)
    return { valid: false, error: 'Les tuiles doivent être sur une même ligne ou colonne.' }

  const posSet = new Set(placed.map((c) => `${c.row},${c.col}`))
  if (posSet.size !== placed.length)
    return { valid: false, error: 'Deux tuiles sur la même case.' }

  for (const { row, col } of placed) {
    if (board[row][col].tile && !board[row][col].isNew)
      return { valid: false, error: 'Case déjà occupée.' }
  }

  const center = 7
  if (isFirstMove) {
    if (!placed.some((c) => c.row === center && c.col === center))
      return { valid: false, error: 'Le premier mot doit passer par la case centrale.' }
    if (placed.length < 2)
      return { valid: false, error: 'Le premier mot doit avoir au moins 2 lettres.' }
  }

  if (rows.size === 1) {
    const row = [...rows][0]
    const sortedCols = [...placed.map((c) => c.col)].sort((a, b) => a - b)
    for (let i = sortedCols[0]; i <= sortedCols[sortedCols.length - 1]; i++)
      if (!board[row][i].tile) return { valid: false, error: 'Il ne peut pas y avoir de trou dans le mot.' }
  } else {
    const col = [...cols][0]
    const sortedRows = [...placed.map((c) => c.row)].sort((a, b) => a - b)
    for (let i = sortedRows[0]; i <= sortedRows[sortedRows.length - 1]; i++)
      if (!board[i][col].tile) return { valid: false, error: 'Il ne peut pas y avoir de trou dans le mot.' }
  }

  if (!isFirstMove) {
    const connected = placed.some(({ row, col }) =>
      [[row-1,col],[row+1,col],[row,col-1],[row,col+1]].some(([r,c]) => {
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false
        return board[r][c].tile && !board[r][c].isNew
      })
    )
    if (!connected) return { valid: false, error: 'Le mot doit être connecté aux tuiles existantes.' }
  }

  return { valid: true }
}

export interface FormedWord { word: string; cells: BoardCell[] }

function getWordInDir(board: BoardCell[][], startRow: number, startCol: number, dRow: number, dCol: number): { word: string; cells: BoardCell[] } | null {
  let r = startRow, c = startCol
  while (r-dRow >= 0 && r-dRow < BOARD_SIZE && c-dCol >= 0 && c-dCol < BOARD_SIZE && board[r-dRow][c-dCol].tile) { r -= dRow; c -= dCol }
  const cells: BoardCell[] = []
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c].tile) { cells.push(board[r][c]); r += dRow; c += dCol }
  if (cells.length < 2) return null
  const word = cells.map((cell) => cell.tile!.isBlank ? (cell.tile!.blankLetter ?? ' ') : cell.tile!.letter).join('')
  return { word, cells }
}

export function getFormedWords(board: BoardCell[][], placed: PlacedCell[]): FormedWord[] {
  const results: FormedWord[] = []
  const seen = new Set<string>()
  const rows = new Set(placed.map((c) => c.row))
  const isHorizontal = rows.size === 1
  const anchor = placed[0]

  const main = isHorizontal ? getWordInDir(board, anchor.row, anchor.col, 0, 1) : getWordInDir(board, anchor.row, anchor.col, 1, 0)
  if (main && main.word.length >= 2) {
    const key = `${main.cells[0].row},${main.cells[0].col},${isHorizontal ? 'H' : 'V'}`
    if (!seen.has(key)) { seen.add(key); results.push(main) }
  }

  for (const { row, col } of placed) {
    const cross = isHorizontal ? getWordInDir(board, row, col, 1, 0) : getWordInDir(board, row, col, 0, 1)
    if (cross && cross.word.length >= 2) {
      const key = `${cross.cells[0].row},${cross.cells[0].col},${isHorizontal ? 'V' : 'H'}`
      if (!seen.has(key)) { seen.add(key); results.push(cross) }
    }
  }

  if (placed.length === 1 && results.length === 0) {
    const h = getWordInDir(board, anchor.row, anchor.col, 0, 1)
    const v = getWordInDir(board, anchor.row, anchor.col, 1, 0)
    if (h) results.push(h)
    if (v) results.push(v)
  }
  return results
}

export function calculateScore(formed: FormedWord[], placed: PlacedCell[], rulesMode: RulesMode): number {
  const placedSet = new Set(placed.map((p) => `${p.row},${p.col}`))
  let total = 0
  for (const { cells } of formed) {
    let wordScore = 0, wordMultiplier = 1
    for (const cell of cells) {
      const letterValue = cell.tile!.points
      const isNew = placedSet.has(`${cell.row},${cell.col}`)
      if (rulesMode === 'classic' && isNew) {
        if (cell.premium === 'DL') wordScore += letterValue * 2
        else if (cell.premium === 'TL') wordScore += letterValue * 3
        else wordScore += letterValue
        if (cell.premium === 'DW' || cell.premium === 'CENTER') wordMultiplier *= 2
        else if (cell.premium === 'TW') wordMultiplier *= 3
      } else {
        wordScore += letterValue
      }
    }
    total += wordScore * wordMultiplier
  }
  if (placed.length === 7) total += SCRABBLE_BONUS
  return total
}

export function validateWords(formed: FormedWord[]): { valid: boolean; invalid: string[] } {
  const invalid = formed.filter((f) => !isValidWord(f.word)).map((f) => f.word)
  return { valid: invalid.length === 0, invalid }
}