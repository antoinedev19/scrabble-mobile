import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, BoardCell, TilePiece, Player, RulesMode, GameMode, AIDifficulty } from '../game/types'
import { BOARD_PREMIUMS, BOARD_SIZE, RACK_SIZE } from '../game/constants'
import { createBag, drawTiles, shuffleBag } from '../game/tileBag'
import {
  validatePlacement,
  getFormedWords,
  calculateScore,
  validateWords,
} from '../game/gameLogic'
import type { PlacedCell } from '../game/gameLogic'
import { decideAIAction } from '../game/aiPlayer'

function createEmptyBoard(): BoardCell[][] {
  return Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, col) => ({
      row,
      col,
      tile: null,
      premium: BOARD_PREMIUMS[row][col],
      isNew: false,
    }))
  )
}

function createInitialState(
  name1: string,
  name2: string,
  rulesMode: RulesMode,
  gameMode: GameMode,
  aiDifficulty: AIDifficulty
): GameState {
  const bag = createBag()
  const [rack1, bag2] = drawTiles(bag, RACK_SIZE)
  const [rack2, bag3] = drawTiles(bag2, RACK_SIZE)
  return {
    board: createEmptyBoard(),
    players: [
      { id: 1, name: name1, score: 0, rack: rack1 },
      { id: 2, name: name2, score: 0, rack: rack2 },
    ],
    currentPlayer: 0,
    bag: bag3,
    phase: 'playing',
    rulesMode,
    gameMode,
    aiDifficulty,
    consecutivePasses: 0,
    message: `${name1} commence !`,
    placedThisTurn: [],
    isFirstMove: true,
  }
}

// ── Calcul des pénalités de fin de partie ────────────────────────────────────

function rackValue(rack: TilePiece[]): number {
  return rack.reduce((s, t) => s + t.points, 0)
}

/**
 * finisherIdx : index du joueur qui a vidé son rack (null = fin par passes)
 * Règle officielle :
 *   - Rack vide : le finisher gagne la valeur du rack adverse, l'adversaire la perd
 *   - 4 passes   : chaque joueur perd la valeur de ses tuiles restantes
 */
function computeEndScores(
  players: [Player, Player],
  finisherIdx: number | null
): { players: [Player, Player]; penaltyMsg: string } {
  if (finisherIdx !== null) {
    const oppIdx = finisherIdx === 0 ? 1 : 0
    const bonus = rackValue(players[oppIdx].rack)
    const updated = players.map((p, i) => ({
      ...p,
      score: i === finisherIdx ? p.score + bonus : p.score - rackValue(p.rack),
    })) as [Player, Player]
    const penaltyMsg = bonus > 0
      ? ` ${players[oppIdx].name} -${rackValue(players[oppIdx].rack)} pts (tuiles). ${players[finisherIdx].name} +${bonus} pts.`
      : ''
    return { players: updated, penaltyMsg }
  }

  const msgs: string[] = []
  const updated = players.map((p) => {
    const penalty = rackValue(p.rack)
    if (penalty > 0) msgs.push(`${p.name} -${penalty}`)
    return { ...p, score: p.score - penalty }
  }) as [Player, Player]
  const penaltyMsg = msgs.length > 0 ? ` Pénalités tuiles : ${msgs.join(', ')} pts.` : ''
  return { players: updated, penaltyMsg }
}

// ── Applique un coup IA et retourne le nouvel état ────────────────────────────

function applyAITurn(prev: GameState): GameState {
  const action = decideAIAction(prev)
  const aiName = prev.players[1].name

  if (action.type === 'pass') {
    const newPasses = prev.consecutivePasses + 1
    const isGameOver = newPasses >= 4
    if (isGameOver) {
      const { players: penalized, penaltyMsg } = computeEndScores(prev.players, null)
      return {
        ...prev,
        players: penalized,
        currentPlayer: 1,
        phase: 'gameover',
        consecutivePasses: newPasses,
        message: 'Partie terminée après 4 passes.' + penaltyMsg,
      }
    }
    return {
      ...prev,
      currentPlayer: 0,
      phase: 'playing',
      consecutivePasses: newPasses,
      message: `${aiName} passe (pas de coup possible).`,
    }
  }

  if (action.type === 'exchange') {
    const rack = prev.players[1].rack
    const [drawn, newBagAfterDraw] = drawTiles(prev.bag, rack.length)
    const finalRack = drawn
    const shuffled = shuffleBag([...newBagAfterDraw, ...rack])
    const newPlayers = prev.players.map((p, i) =>
      i === 1 ? { ...p, rack: finalRack } : p
    ) as GameState['players']
    return {
      ...prev,
      players: newPlayers,
      bag: shuffled,
      currentPlayer: 0,
      consecutivePasses: prev.consecutivePasses + 1,
      message: `${aiName} échange ses tuiles.`,
    }
  }

  // action.type === 'move'
  const move = action.move
  const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })))
  const placed: PlacedCell[] = []

  for (const { row, col, tile } of move.placements) {
    newBoard[row][col] = { ...newBoard[row][col], tile, isNew: false }
    placed.push({ row, col })
  }

  const usedIds = new Set(move.placements.map((p) => p.tile.id))
  const newAIRack = prev.players[1].rack.filter((t) => !usedIds.has(t.id))
  const [drawn, newBag] = drawTiles(prev.bag, Math.min(RACK_SIZE - newAIRack.length, prev.bag.length))
  const finalRack = [...newAIRack, ...drawn]

  const isGameOver = newBag.length === 0 && finalRack.length === 0
  const bonusMsg = move.placements.length === 7 ? ' SCRABBLE ! +50 pts' : ''

  let finalPlayers = prev.players.map((p, i) =>
    i === 1 ? { ...p, score: p.score + move.score, rack: finalRack } : p
  ) as [Player, Player]
  let gameOverMsg = 'Partie terminée !'

  if (isGameOver) {
    const { players: penalized, penaltyMsg } = computeEndScores(finalPlayers, 1)
    finalPlayers = penalized
    gameOverMsg = 'Partie terminée !' + penaltyMsg
  }

  return {
    ...prev,
    board: newBoard,
    players: finalPlayers as GameState['players'],
    bag: newBag,
    currentPlayer: isGameOver ? 1 : 0,
    phase: isGameOver ? 'gameover' : 'playing',
    consecutivePasses: 0,
    placedThisTurn: [],
    isFirstMove: false,
    message: isGameOver
      ? gameOverMsg
      : `${aiName} joue : ${move.words.join(', ')} (+${move.score} pts)${bonusMsg}`,
  }
}

// ── Hook principal ────────────────────────────────────────────────────────────

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
    } else if (!state || state.phase === 'gameover') {
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
      // Si c'était le tour de l'IA, on relance
      if (saved.gameMode === 'vsAI' && saved.currentPlayer === 1) {
        setTimeout(() => {
          setIsAIThinking(true)
          aiTimerRef.current = setTimeout(() => {
            setState((prev) => {
              if (!prev || prev.phase === 'gameover') return prev
              return applyAITurn(prev)
            })
            setIsAIThinking(false)
          }, 1400)
        }, 300)
      }
    } catch {
      localStorage.removeItem('scrabble-save')
    }
  }, [])

  /** Déclenche le tour IA après un délai (appeler quand c'est au tour de l'IA) */
  const triggerAI = useCallback(() => {
    setIsAIThinking(true)
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    aiTimerRef.current = setTimeout(() => {
      setState((prev) => {
        if (!prev || prev.phase === 'gameover') return prev
        return applyAITurn(prev)
      })
      setIsAIThinking(false)
    }, 1400)
  }, [])

  // ── Menu ──────────────────────────────────────────────────────────────────

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

  // ── Sélection d'une tuile du rack ─────────────────────────────────────────

  const selectRackTile = useCallback((idx: number) => {
    setSelectedRackIdx((prev) => (prev === idx ? null : idx))
  }, [])

  // ── Poser une tuile sur le plateau ────────────────────────────────────────

  const placeTile = useCallback(
    (row: number, col: number, blankLetter?: string) => {
      if (!state) return
      if (selectedRackIdx === null) return

      const cell = state.board[row][col]
      if (cell.tile) return

      const player = state.players[state.currentPlayer]
      const tile = player.rack[selectedRackIdx]
      if (!tile) return

      if (tile.isBlank && !blankLetter) {
        setPendingBlank({ tile, row, col })
        return
      }

      const placedTile: TilePiece = blankLetter ? { ...tile, blankLetter, points: 0 } : tile

      setState((prev) => {
        if (!prev) return prev
        const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })))
        newBoard[row][col] = { ...newBoard[row][col], tile: placedTile, isNew: true }

        const newRack = [...prev.players[prev.currentPlayer].rack]
        newRack.splice(selectedRackIdx, 1)

        const newPlayers = prev.players.map((p, i) =>
          i === prev.currentPlayer ? { ...p, rack: newRack } : p
        ) as GameState['players']

        return {
          ...prev,
          board: newBoard,
          players: newPlayers,
          placedThisTurn: [...prev.placedThisTurn, { row, col }],
          message: '',
        }
      })
      setSelectedRackIdx(null)
      setPendingBlank(null)
    },
    [state, selectedRackIdx]
  )

  // ── Confirmer la lettre du joker ──────────────────────────────────────────

  const confirmBlankLetter = useCallback(
    (letter: string) => {
      if (!pendingBlank) return
      placeTile(pendingBlank.row, pendingBlank.col, letter)
    },
    [pendingBlank, placeTile]
  )

  const cancelBlank = useCallback(() => {
    setPendingBlank(null)
    setSelectedRackIdx(null)
  }, [])

  // ── Reprendre une ou toutes les tuiles posées ce tour ────────────────────

  const recallTile = useCallback(
    (row: number, col: number) => {
      setState((prev) => {
        if (!prev) return prev
        const cell = prev.board[row][col]
        if (!cell.tile || !cell.isNew) return prev

        const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })))
        newBoard[row][col] = { ...newBoard[row][col], tile: null, isNew: false }

        const restoredTile: TilePiece = { ...cell.tile, blankLetter: undefined }
        const newRack = [...prev.players[prev.currentPlayer].rack, restoredTile]
        const newPlayers = prev.players.map((p, i) =>
          i === prev.currentPlayer ? { ...p, rack: newRack } : p
        ) as GameState['players']

        return {
          ...prev,
          board: newBoard,
          players: newPlayers,
          placedThisTurn: prev.placedThisTurn.filter((p) => !(p.row === row && p.col === col)),
          message: '',
        }
      })
    },
    []
  )

  const recallAllTiles = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.placedThisTurn.length === 0) return prev
      const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })))
      const restored: TilePiece[] = []

      for (const { row, col } of prev.placedThisTurn) {
        const tile = newBoard[row][col].tile
        if (tile) {
          restored.push({ ...tile, blankLetter: undefined })
          newBoard[row][col] = { ...newBoard[row][col], tile: null, isNew: false }
        }
      }

      const newRack = [...prev.players[prev.currentPlayer].rack, ...restored]
      const newPlayers = prev.players.map((p, i) =>
        i === prev.currentPlayer ? { ...p, rack: newRack } : p
      ) as GameState['players']

      return { ...prev, board: newBoard, players: newPlayers, placedThisTurn: [], message: '' }
    })
  }, [])

  // ── Valider le coup ───────────────────────────────────────────────────────

  const validateMove = useCallback(() => {
    if (!state) return

    const placed: PlacedCell[] = state.placedThisTurn

    const placementResult = validatePlacement(state.board, placed, state.isFirstMove)
    if (!placementResult.valid) {
      setState((prev) => prev && { ...prev, message: placementResult.error })
      return
    }

    const formed = getFormedWords(state.board, placed)
    if (formed.length === 0) {
      setState((prev) => prev && { ...prev, message: 'Aucun mot formé.' })
      return
    }

    const { valid, invalid } = validateWords(formed)
    if (!valid) {
      setState((prev) =>
        prev && { ...prev, message: `Mot(s) invalide(s) : ${invalid.join(', ')}` }
      )
      return
    }

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
      const newBoard = prev.board.map((r) =>
        r.map((c) => (c.isNew ? { ...c, isNew: false } : c))
      )
      let updatedPlayers = prev.players.map((p, i) =>
        i === prev.currentPlayer ? { ...p, score: p.score + score, rack: newRack } : p
      ) as [Player, Player]
      let gameOverMsg = 'Partie terminée !'

      if (isGameOver) {
        const { players: penalized, penaltyMsg } = computeEndScores(updatedPlayers, prev.currentPlayer)
        updatedPlayers = penalized
        gameOverMsg = 'Partie terminée !' + penaltyMsg
      }

      return {
        ...prev,
        board: newBoard,
        players: updatedPlayers as GameState['players'],
        bag: newBag,
        currentPlayer: isGameOver ? prev.currentPlayer : nextPlayer,
        phase: isGameOver ? 'gameover' : 'playing',
        consecutivePasses: 0,
        placedThisTurn: [],
        isFirstMove: false,
        message: isGameOver
          ? gameOverMsg
          : `${player.name} : ${wordsStr} (+${score} pts)${bonusMsg}`,
      }
    })

    // Déclencher l'IA si c'est son tour
    if (isVsAI && nextPlayer === 1 && !isGameOver) {
      triggerAI()
    }
  }, [state, triggerAI])

  // ── Passer son tour ───────────────────────────────────────────────────────

  const passTurn = useCallback(() => {
    if (!state) return

    const isVsAI = state.gameMode === 'vsAI'
    const currentIdx = state.currentPlayer
    const nextPlayer = currentIdx === 0 ? 1 : 0
    const newPasses = state.consecutivePasses + 1
    const wouldGameOver = newPasses >= 4

    setState((prev) => {
      if (!prev) return prev
      const newBoard = prev.board.map((r) =>
        r.map((c) => (c.isNew ? { ...c, tile: null, isNew: false } : c))
      )
      const recalledTiles = prev.placedThisTurn
        .map(({ row, col }) => prev.board[row][col].tile!)
        .map((t) => ({ ...t, blankLetter: undefined }))

      const newRack = [...prev.players[currentIdx].rack, ...recalledTiles]
      let updatedPlayers = prev.players.map((p, i) =>
        i === currentIdx ? { ...p, rack: newRack } : p
      ) as [Player, Player]
      let passMsg = `${prev.players[currentIdx].name} passe son tour.`

      if (wouldGameOver) {
        const { players: penalized, penaltyMsg } = computeEndScores(updatedPlayers, null)
        updatedPlayers = penalized
        passMsg = 'Partie terminée après 4 passes.' + penaltyMsg
      }

      return {
        ...prev,
        board: newBoard,
        players: updatedPlayers as GameState['players'],
        currentPlayer: wouldGameOver ? currentIdx : nextPlayer,
        phase: wouldGameOver ? 'gameover' : 'playing',
        consecutivePasses: newPasses,
        placedThisTurn: [],
        message: passMsg,
      }
    })
    setSelectedRackIdx(null)

    if (isVsAI && nextPlayer === 1 && !wouldGameOver) {
      triggerAI()
    }
  }, [state, triggerAI])

  // ── Échanger des tuiles ───────────────────────────────────────────────────

  const exchangeTiles = useCallback(
    (indices: number[]) => {
      if (!state) return
      if (state.bag.length < indices.length) {
        setState((prev) => prev && { ...prev, message: 'Pas assez de tuiles dans le sac pour échanger.' })
        return
      }

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

        const newPlayers = prev.players.map((p, i) =>
          i === currentIdx ? { ...p, rack: finalRack } : p
        ) as GameState['players']

        const nextPlayer = currentIdx === 0 ? 1 : 0

        return {
          ...prev,
          players: newPlayers,
          bag: shuffled,
          currentPlayer: nextPlayer,
          consecutivePasses: prev.consecutivePasses + 1,
          placedThisTurn: [],
          message: `${player.name} a échangé ${indices.length} tuile(s).`,
        }
      })
      setSelectedRackIdx(null)

      const nextPlayer = currentIdx === 0 ? 1 : 0
      if (isVsAI && nextPlayer === 1) {
        triggerAI()
      }
    },
    [state, triggerAI]
  )

  return {
    state,
    selectedRackIdx,
    isAIThinking,
    pendingBlank,
    hasSavedGame,
    resumeSavedGame,
    startGame,
    returnToMenu,
    selectRackTile,
    placeTile,
    recallTile,
    recallAllTiles,
    validateMove,
    passTurn,
    exchangeTiles,
    confirmBlankLetter,
    cancelBlank,
  }
}
