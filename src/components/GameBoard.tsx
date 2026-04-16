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
  TW: { bg: 'bg-[#C0392B]', label: 'Mot ×3', short: 'M3' },
  DW: { bg: 'bg-[#E8A0A0]', label: 'Mot ×2', short: 'M2' },
  CENTER: { bg: 'bg-[#E8A0A0]', label: 'Centre', short: '★' },
  TL: { bg: 'bg-[#2980B9]', label: 'Let ×3', short: 'L3' },
  DL: { bg: 'bg-[#85C1E9]', label: 'Let ×2', short: 'L2' },
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
          gap: 1,
          padding: 3,
          backgroundColor: '#1a0f06',
          borderRadius: 8,
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
                  if (cell.tile && isNew) onTileRecall(cell.row, cell.col)
                  else if (!cell.tile && selectedRackTile) onCellClick(cell.row, cell.col)
                }}
                className={`
                  relative aspect-square flex items-center justify-center rounded-[2px]
                  ${cell.tile ? 'bg-transparent' : premium ? premium.bg : 'bg-[#C8A96E]'}
                  ${selectedRackTile && !cell.tile ? 'active:brightness-110' : ''}
                  ${isNew ? 'ring-1 ring-yellow-400 ring-inset' : ''}
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
                    <TilePiece tile={cell.tile} small selected={isNew} />
                  </motion.div>
                ) : premium ? (
                  <span className="text-white font-bold select-none leading-none"
                    style={{ fontSize: 'clamp(5px, 1.8vw, 9px)' }}>
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