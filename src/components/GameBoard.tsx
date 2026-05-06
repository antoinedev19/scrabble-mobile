import { motion } from 'framer-motion'
import type { BoardCell } from '../game/types'
import TilePiece from './TilePiece'

interface Props {
  board: BoardCell[][]
  placedThisTurn: { row: number; col: number }[]
  selectedRackTile: boolean
  onCellClick: (row: number, col: number) => void
  onTileRecall: (row: number, col: number) => void
}

const PREMIUM_STYLES: Record<string, { bg: string; label: string; short: string }> = {
  TW:     { bg: 'bg-[#B83228]', label: 'Mot ×3',  short: 'M3' },
  DW:     { bg: 'bg-[#C87090]', label: 'Mot ×2',  short: 'M2' },
  CENTER: { bg: 'bg-[#C87090]', label: 'Centre',   short: '★'  },
  TL:     { bg: 'bg-[#2070A8]', label: 'Let ×3',  short: 'L3' },
  DL:     { bg: 'bg-[#5899C8]', label: 'Let ×2',  short: 'L2' },
}

export default function GameBoard({ board, placedThisTurn, selectedRackTile, onCellClick, onTileRecall }: Props) {
  const placedSet = new Set(placedThisTurn.map((p) => `${p.row},${p.col}`))

  return (
    <div className="w-full flex justify-center">
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(15, 1fr)',
          width: 'min(calc(100vw - 8px), 480px)',
          gap: 1.5,
          padding: 4,
          background: 'radial-gradient(ellipse at center, #1f1208 0%, #14100A 100%)',
          borderRadius: 12,
          boxShadow: 'inset 0 1px 0 rgba(200,169,110,0.1)',
        }}
      >
        {board.map((row) =>
          row.map((cell) => {
            const isNew = placedSet.has(`${cell.row},${cell.col}`)
            const premium = PREMIUM_STYLES[cell.premium ?? '']

            return (
              <div
                key={`${cell.row}-${cell.col}`}
                onClick={() => {
                  if (cell.tile && isNew) {
                    onTileRecall(cell.row, cell.col)
                  } else if (!cell.tile && selectedRackTile) {
                    onCellClick(cell.row, cell.col)
                  }
                }}
                className={`
                  relative aspect-square flex items-center justify-center rounded-[2px]
                  ${cell.tile
                    ? 'bg-transparent'
                    : premium
                      ? premium.bg
                      : 'bg-[#C8A96E]'
                  }
                  ${selectedRackTile && !cell.tile ? 'active:brightness-110' : ''}
                  ${isNew && !cell.premium ? 'ring-1 ring-yellow-400 ring-inset' : ''}
                `}
                style={{ cursor: (cell.tile && isNew) || (!cell.tile && selectedRackTile) ? 'pointer' : 'default' }}
              >
                {cell.tile ? (
                  <motion.div
                    initial={isNew ? { scale: 0.5, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="w-full h-full"
                  >
                    <TilePiece
                      tile={cell.tile}
                      small
                      selected={isNew}
                      bonusType={isNew ? cell.premium : undefined}
                    />
                  </motion.div>
                ) : premium ? (
                  <span className="text-white font-bold select-none leading-none"
                    style={{ fontSize: 'clamp(7px, 1.8vw, 9px)' }}>
                    {premium.short}
                  </span>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
