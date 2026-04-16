import { motion } from 'framer-motion'
import type { TilePiece as TilePieceType } from '../game/types'

interface Props { tile: TilePieceType; selected?: boolean; small?: boolean; onClick?: () => void; disabled?: boolean }

export default function TilePiece({ tile, selected, small, onClick, disabled }: Props) {
  const letter = tile.isBlank ? (tile.blankLetter ?? '') : tile.letter
  const size = small ? 'w-8 h-8 text-sm' : 'w-11 h-11 text-lg'
  const pointSize = small ? 'text-[7px]' : 'text-[9px]'

  return (
    <motion.button onClick={onClick} disabled={disabled} whileTap={onClick && !disabled ? { scale: 0.92 } : undefined} animate={selected ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`relative ${size} rounded-md flex items-center justify-center font-bold font-serif select-none cursor-pointer shadow-md border ${selected ? 'bg-[#F0C040] border-[#C8A000] text-[#2D1B0E]' : 'bg-[#F5E6C8] border-[#C8A96E] text-[#2D1B0E]'} ${tile.isBlank ? 'italic text-[#8B6914]' : ''} ${disabled ? 'opacity-50 cursor-default' : ''}`}>
      <span className="leading-none">{letter}</span>
      {!tile.isBlank && <span className={`absolute bottom-0.5 right-1 ${pointSize} font-normal opacity-70`}>{tile.points}</span>}
    </motion.button>
  )
}