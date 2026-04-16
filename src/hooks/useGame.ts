import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, BoardCell, TilePiece, RulesMode, GameMode, AIDifficulty } from '../game/types'
import { BOARD_PREMIUMS, BOARD_SIZE, RACK_SIZE } from '../game/constants'
import { createBag, drawTiles, shuffleBag } from '../game/tileBag'
import { validatePlacement, getFormedWords, calculateScore, validateWords } from '../game/gameLogic'
import type { PlacedCell } from '../game/gameLogic'
import { decideAIAction } from '../game/aiPlayer'

function createEmptyBoard(): BoardCell[][] {
  return Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, col) => ({
      row, col, tile: null, premium: BOARD_PREMIUMS[row][col], isNew: false,
    }))
  )
}

function createInitialState(name1: string, name2: string, rulesMode: RulesMode, gameMode: GameMode, aiDifficulty: AIDifficulty): GameState {
  const bag = createBag()
  const [rack1, bag2] = drawTiles(bag, RACK_SIZE)
  const [rack2, bag3] = drawTiles(bag2, RACK_SIZE)
  return {
    board: createEmptyBoard(),
    players: [{ id: 1, name: name1, score: 0, rack: rack1 }, { id: 2, name: name2, score: 0, rack: rack2 }],
    currentPlayer: 0,
    bag: bag3,
    phase: 'playing',
    rulesMode, gameMode, aiDifficulty,
    consecutivePasses: 0,
    message: `${name1} commence !`,
    placedThisTurn: [],
    isFirstMove: true,
  }
}

function applyAITurn(prev: GameState): GameState {
  const action = decideAIAction(prev)
  const aiName = prev.players[1].name

  if (action.type === 'pass') {
    const newPasses = prev.consecutivePasses + 1
    const isGameOver = newPasses >= 4
    return { ...prev, currentPlayer: isGameOver ? 1 : 0, phase: isGameOver ? 'gameover' : 'playing', consecutivePasses: newPasses, message: isGameOver ? 'Partie terminée après trop de passes.' : `${aiName} passe (pas de coup possible).` }
  }

  if (action.type === 'exchange') {
    const rack = prev.players[1].rack
    const [drawn, newBagAfterDraw] = drawTiles(prev.bag, rack.length)
    const shuffled = shuffleBag([...newBagAfterDraw, ...rack])
    const newPlayers = prev.players.map((p, i) => i === 1 ? { ...p, rack: drawn } : p) as GameState['players']
    return { ...prev, players: newPlayers, bag: shuffled, currentPlayer: 0, consecutivePasses: prev.consecutivePasses + 1, message: `${aiName} échange ses tuiles.` }
  }

  const move = action.move
  const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })))
  const placed: PlacedCell[] = []
  for (const { row, col, tile } of move.placements) { newBoard[row][col] = { ...newBoard[row][col], tile, isNew: false }; placed.push({ row, col }) }

  const usedIds = new Set(move.placements.map((p) => p.tile.id))
  const newAIRack = prev.players[1].rack.filter((t) => !usedIds.has(t.id))
  const [drawn, newBag] = drawTiles(prev.bag, Math.min(RACK_SIZE - newAIRack.length, prev.bag.length))
  const finalRack = [...newAIRack, ...drawn]
  const isGameOver = newBag.length === 0 && finalRack.length === 0
  const bonusMsg = move.placements.length === 7 ? ' SCRABBLE ! +50 pts' : ''
  const newPlayers = prev.players.map((p, i) => i === 1 ? { ...p, score: p.score + move.score, rack: finalRack } : p) as GameState['players']

  return { ...prev, board: newBoard, players: newPlayers, bag: newBag, currentPlayer: isGameOver ? 1 : 0, phase: isGameOver ? 'gameover' : 'playing', consecutivePasses: 0, placedThisTurn: [], isFirstMove: false, message: isGameOver ? 'Partie terminée !' : `${aiName} joue : ${move.words.join(', ')} (+${move.score} pts)${bonusMsg}` }
}

export function useGame() {
  const [state, setState] = useState<GameState | null>(null)
  const [selectedRackIdx, setSelectedRackIdx] = useState<number | null>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [pendingBlank, setPendingBlank] = useState<{ tile: TilePiece; row: number; col: number } | null>(null)
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Sauvegarde locale ─────────────────────────────────────────────────────
  useEffect(() => {
    if (state && state.phase !== 'gameover') {
      localStorage.setItem('scrabble-save', JSON.stringify(state))
    } else {
      localStorage.removeItem('scrabble-save')
    }
  }, [state])

  const hasSavedGame = (): boolean => {
    try {
      const raw = localStorage.getItem('scrabble-save')
      if (!raw) return false
      const saved = JSON.parse(raw) as GameState
      return saved.phase === 'playing'
    } catch { return false }
  }

  const resumeSavedGame = useCallback(() => {
    try {
      const raw = localStorage.getItem('scrabble-save')
      if (!raw) return
      const saved = JSON.parse(raw) as GameState
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
      setIsAIThinking(false)
      setState(saved)
      setSelectedRackIdx(null)
      if (saved.gameMode === 'vsAI' && saved.currentPlayer === 1) {
        setTimeout(() => {
          setIsAIThinking(true)
          aiTimerRef.current = setTimeout(() => {
            setState((prev) => { if (!prev || prev.phase === 'gameover') return prev; return applyAITurn(prev) })
            setIsAIThinking(false)
          }, 1400)
        }, 300)
      }
    } catch { localStorage.removeItem('scrabble-save') }
  }, [])

  const triggerAI = useCallback(() => {
    setIsAIThinking(true)
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    aiTimerRef.current = setTimeout(() => {
      setState((prev) => { if (!prev || prev.phase === 'gameover') return prev; return applyAITurn(prev) })
      setIsAIThinking(false)
    }, 1400)
  }, [])

  const startGame = useCallback((name1: string, name2: string, rulesMode: RulesMode, gameMode: GameMode, aiDifficulty: AIDifficulty) => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    setIsAIThinking(false)
    setState(createInitialState(name1, name2, rulesMode, gameMode, aiDifficulty))
    setSelectedRackIdx(null)
  }, [])

  const returnToMenu = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    setIsAIThinking(false)
    setState(null)
    setSelectedRackIdx(null)
  }, [])

  const selectRackTile = useCallback((idx: number) => {
    setSelectedRackIdx((prev) => (prev === idx ? null : idx))
  }, [])

  const placeTile = useCallback((row: number, col: number, blankLetter?: string) => {
    if (!state) return
    if (selectedRackIdx === null) return
    const cell = state.board[row][col]
    if (cell.tile) return
    const player = state.players[state.currentPlayer]
    const tile = player.rack[selectedRackIdx]
    if (!tile) return
    if (tile.isBlank && !blankLetter) { setPendingBlank({ tile, row, col }); return }
    const placedTile: TilePiece = blankLetter ? { ...tile, blankLetter, points: 0 } : tile
    setState((prev) => {
      if (!prev) return prev
      const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })))
      newBoard[row][col] = { ...newBoard[row][col], tile: placedTile, isNew: true }
      const newRack = [...prev.players[prev.currentPlayer].rack]
      newRack.splice(selectedRackIdx, 1)
      const newPlayers = prev.players.map((p, i) => i === prev.currentPlayer ? { ...p, rack: newRack } : p) as GameState['players']
      return { ...prev, board: newBoard, players: newPlayers, placedThisTurn: [...prev.placedThisTurn, { row, col }], message: '' }
    })
    setSelectedRackIdx(null)
    setPendingBlank(null)
  }, [state, selectedRackIdx])

  const confirmBlankLetter = useCallback((letter: string) => {
    if (!pendingBlank) return
    placeTile(pendingBlank.row, pendingBlank.col, letter)
  }, [pendingBlank, placeTile])

  const cancelBlank = useCallback(() => { setPendingBlank(null); setSelectedRackIdx(null) }, [])

  const recallTile = useCallback((row: number, col: number) => {
    setState((prev) => {
      if (!prev) return prev
      const cell = prev.board[row][col]
      if (!cell.tile || !cell.isNew) return prev
      const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })))
      newBoard[row][col] = { ...newBoard[row][col], tile: null, isNew: false }
      const restoredTile: TilePiece = { ...cell.tile, blankLetter: undefined }
      const newRack = [...prev.players[prev.currentPlayer].rack, restoredTile]
      const newPlayers = prev.players.map((p, i) => i === prev.currentPlayer ? { ...p, rack: newRack } : p) as GameState['players']
      return { ...prev, board: newBoard, players: newPlayers, placedThisTurn: prev.placedThisTurn.filter((p) => !(p.row === row && p.col === col)), message: '' }
    })
  }, [])

  const recallAllTiles = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.placedThisTurn.length === 0) return prev
      const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })))
      const restored: TilePiece[] = []
      for (const { row, col } of prev.placedThisTurn) {
        const tile = newBoard[row][col].tile
        if (tile) { restored.push({ ...tile, blankLetter: undefined }); newBoard[row][col] = { ...newBoard[row][col], tile: null, isNew: false } }
      }
      const newRack = [...prev.players[prev.currentPlayer].rack, ...restored]
      const newPlayers = prev.players.map((p, i) => i === prev.currentPlayer ? { ...p, rack: newRack } : p) as GameState['players']
      return { ...prev, board: newBoard, players: newPlayers, placedThisTurn: [], message: '' }
    })
  }, [])

  const validateMove = useCallback(() => {
    if (!state) return
    const placed: PlacedCell[] = state.placedThisTurn
    const placementResult = validatePlacement(state.board, placed, state.isFirstMove)
    if (!placementResult.valid) { setState((prev) => prev && { ...prev, message: placementResult.error }); return }
    const formed = getFormedWords(state.board, placed)
    if (formed.length === 0) { setState((prev) => prev && { ...prev, message: 'Aucun mot formé.' }); return }
    const { valid, invalid } = validateWords(formed)
    if (!valid) { setState((prev) => prev && { ...prev, message: `Mot(s) invalide(s) : ${invalid.join(', ')}` }); return }
    const score = calculateScore(formed, placed, state.rulesMode)
    const wordsStr = formed.map((f) => f.word).join(', ')
    const player = state.players[state.currentPlayer]
    const [drawn, newBag] = drawTiles(state.bag, Math.min(RACK_SIZE - player.rack.length, state.bag.length))
    const nextPlayer = state.currentPlayer === 0 ? 1 : 0
    const newRack = [...player.rack, ...drawn]
    const isGameOver = newBag.length === 0 && newRack.length === 0
    const bonusMsg = placed.length === 7 ? ' 🎉 SCRABBLE ! +50 pts' : ''
    const isVsAI = state.gameMode === 'vsAI'
    setState((prev) => {
      if (!prev) return prev
      const newBoard = prev.board.map((r) => r.map((c) => (c.isNew ? { ...c, isNew: false } : c)))
      const newPlayers = prev.players.map((p, i) => i === prev.currentPlayer ? { ...p, score: p.score + score, rack: newRack } : p) as GameState['players']
      return { ...prev, board: newBoard, players: newPlayers, bag: newBag, currentPlayer: isGameOver ? prev.currentPlayer : nextPlayer, phase: isGameOver ? 'gameover' : 'playing', consecutivePasses: 0, placedThisTurn: [], isFirstMove: false, message: isGameOver ? 'Partie terminée !' : `${player.name} : ${wordsStr} (+${score} pts)${bonusMsg}` }
    })
    if (isVsAI && nextPlayer === 1 && !isGameOver) triggerAI()
  }, [state, triggerAI])

  const passTurn = useCallback(() => {
    if (!state) return
    const isVsAI = state.gameMode === 'vsAI'
    const currentIdx = state.currentPlayer
    setState((prev) => {
      if (!prev) return prev
      const newBoard = prev.board.map((r) => r.map((c) => (c.isNew ? { ...c, tile: null, isNew: false } : c)))
      const recalledTiles = prev.placedThisTurn.map(({ row, col }) => prev.board[row][col].tile!).map((t) => ({ ...t, blankLetter: undefined }))
      const newRack = [...prev.players[currentIdx].rack, ...recalledTiles]
      const newPlayers = prev.players.map((p, i) => i === currentIdx ? { ...p, rack: newRack } : p) as GameState['players']
      const nextPlayer = currentIdx === 0 ? 1 : 0
      const newPasses = prev.consecutivePasses + 1
      const isGameOver = newPasses >= 4
      return { ...prev, board: newBoard, players: newPlayers, currentPlayer: isGameOver ? currentIdx : nextPlayer, phase: isGameOver ? 'gameover' : 'playing', consecutivePasses: newPasses, placedThisTurn: [], message: isGameOver ? 'Partie terminée après 4 passes consécutives.' : `${prev.players[currentIdx].name} passe son tour.` }
    })
    setSelectedRackIdx(null)
    const nextPlayer = currentIdx === 0 ? 1 : 0
    const newPasses = state.consecutivePasses + 1
    if (isVsAI && nextPlayer === 1 && newPasses < 4) triggerAI()
  }, [state, triggerAI])

  const exchangeTiles = useCallback((indices: number[]) => {
    if (!state) return
    if (state.bag.length < indices.length) { setState((prev) => prev && { ...prev, message: 'Pas assez de tuiles dans le sac pour échanger.' }); return }
    const isVsAI = state.gameMode === 'vsAI'
    const currentIdx = state.currentPlayer
    setState((prev) => {
      if (!prev) return prev
      const player = prev.players[currentIdx]
      const tilesToReturn = indices.map((i) => player.rack[i])
      const newRack = player.rack.filter((_, i) => !indices.includes(i))
      const [drawn, newBagAfterDraw] = drawTiles(prev.bag, indices.length)
      const finalRack = [...newRack, ...drawn]
      const shuffled = shuffleBag([...newBagAfterDraw, ...tilesToReturn])
      const newPlayers = prev.players.map((p, i) => i === currentIdx ? { ...p, rack: finalRack } : p) as GameState['players']
      const nextPlayer = currentIdx === 0 ? 1 : 0
      return { ...prev, players: newPlayers, bag: shuffled, currentPlayer: nextPlayer, consecutivePasses: prev.consecutivePasses + 1, placedThisTurn: [], message: `${player.name} a échangé ${indices.length} tuile(s).` }
    })
    setSelectedRackIdx(null)
    const nextPlayer = currentIdx === 0 ? 1 : 0
    if (isVsAI && nextPlayer === 1) triggerAI()
  }, [state, triggerAI])

  return {
    state, selectedRackIdx, isAIThinking, pendingBlank,
    hasSavedGame, resumeSavedGame,
    startGame, returnToMenu, selectRackTile, placeTile,
    recallTile, recallAllTiles, validateMove, passTurn, exchangeTiles,
    confirmBlankLetter, cancelBlank,
  }
}