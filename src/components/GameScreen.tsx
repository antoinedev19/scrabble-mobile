import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameState } from '../game/types'
import GameBoard from './GameBoard'
import PlayerRack from './PlayerRack'
import ScorePanel from './ScorePanel'
import GameControls from './GameControls'
import BlankTileModal from './BlankTileModal'
import ExchangeModal from './ExchangeModal'
import GameOver from './GameOver'

interface Props {
  state: GameState
  selectedRackIdx: number | null
  isAIThinking: boolean
  pendingBlank: { tile: import('../game/types').TilePiece; row: number; col: number } | null
  onSelectRack: (idx: number) => void
  onPlaceTile: (row: number, col: number) => void
  onRecallTile: (row: number, col: number) => void
  onRecallAll: () => void
  onValidate: () => void
  onPass: () => void
  onExchange: (indices: number[]) => void
  onConfirmBlank: (letter: string) => void
  onCancelBlank: () => void
  onPlayAgain: () => void
  onMenu: () => void
}

export default function GameScreen({
  state,
  selectedRackIdx,
  isAIThinking,
  pendingBlank,
  onSelectRack,
  onPlaceTile,
  onRecallTile,
  onRecallAll,
  onValidate,
  onPass,
  onExchange,
  onConfirmBlank,
  onCancelBlank,
  onPlayAgain,
  onMenu,
}: Props) {
  const [showExchange, setShowExchange] = useState(false)

  const currentPlayer = state.players[state.currentPlayer]
  const hasPlaced = state.placedThisTurn.length > 0
  const isAITurn = isAIThinking

  return (
    <div className="min-h-screen bg-[#1a0f06] flex flex-col select-none">
      {/* Score */}
      <ScorePanel
        players={state.players}
        currentPlayer={state.currentPlayer}
        bagCount={state.bag.length}
      />

      {/* Message */}
      <AnimatePresence mode="wait">
        {state.message && (
          <motion.div
            key={state.message}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-1.5 text-center"
          >
            <span className="text-[#C8A96E] text-xs">{state.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plateau */}
      <div className="flex-1 flex items-center justify-center px-1 py-2">
        <GameBoard
          board={state.board}
          placedThisTurn={state.placedThisTurn}
          selectedRackTile={selectedRackIdx !== null}
          onCellClick={onPlaceTile}
          onTileRecall={onRecallTile}
        />
      </div>

      {/* Joueur actuel */}
      <div className="px-3 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[#8B6914] text-xs">
            {currentPlayer.name} — {state.bag.length} tuile(s) dans le sac
          </span>
          {hasPlaced && (
            <button
              onClick={onRecallAll}
              className="text-[#8B6914] text-xs underline"
            >
              Tout reprendre
            </button>
          )}
        </div>
      </div>

      {/* Rack */}
      <div className="bg-[#2a1a0c] border-t border-[#8B6914]/20 pb-safe">
        {isAITurn ? (
          <div className="flex items-center justify-center h-14">
            <span className="text-[#C8A96E] text-sm animate-pulse">🤖 Jarvis réfléchit…</span>
          </div>
        ) : (
          <PlayerRack
            rack={currentPlayer.rack}
            selectedIdx={selectedRackIdx}
            onSelect={onSelectRack}
          />
        )}

        {/* Contrôles */}
        <GameControls
          onValidate={onValidate}
          onPass={onPass}
          onExchange={() => setShowExchange(true)}
          canValidate={hasPlaced && !isAITurn}
          canExchange={state.bag.length >= 1 && !isAITurn}
        />
      </div>

      {/* Modals */}
      <BlankTileModal
        open={!!pendingBlank}
        onSelect={onConfirmBlank}
        onCancel={onCancelBlank}
      />
      <ExchangeModal
        open={showExchange}
        rack={currentPlayer.rack}
        onConfirm={(indices) => { onExchange(indices); setShowExchange(false) }}
        onCancel={() => setShowExchange(false)}
      />

      {/* Game Over */}
      {state.phase === 'gameover' && (
        <GameOver
          players={state.players}
          endMessage={state.message}
          onPlayAgain={onPlayAgain}
          onMenu={onMenu}
        />
      )}
    </div>
  )
}
