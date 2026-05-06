import { motion } from 'framer-motion'
import type { TilePiece as TilePieceType, PremiumType } from '../game/types'

interface Props {
  tile: TilePieceType
  selected?: boolean
  small?: boolean
  onClick?: () => void
  disabled?: boolean
  bonusType?: PremiumType
}

const BONUS_STYLES: Record<string, { bg: string; border: string; ring: string; badge: string; badgeColor: string }> = {
  TW:     { bg: '#FDDAD6', border: '#C0392B', ring: '#C0392B', badge: 'M×3', badgeColor: '#C0392B' },
  DW:     { bg: '#FDE8E6', border: '#C8607A', ring: '#C8607A', badge: 'M×2', badgeColor: '#C0607A' },
  CENTER: { bg: '#FDE8E6', border: '#C8607A', ring: '#C8607A', badge: 'M×2', badgeColor: '#C0607A' },
  TL:     { bg: '#D6E8F6', border: '#2980B9', ring: '#2980B9', badge: 'L×3', badgeColor: '#2980B9' },
  DL:     { bg: '#E6F2FA', border: '#5AAAD0', ring: '#5AAAD0', badge: 'L×2', badgeColor: '#4A9BC0' },
}

export default function TilePiece({ tile, selected, small, onClick, disabled, bonusType }: Props) {
  const letter = tile.isBlank ? (tile.blankLetter ?? '') : tile.letter
  const size = small ? 'w-8 h-8 text-sm' : 'w-11 h-11 text-lg'
  const pointSize = small ? 'text-[9px]' : 'text-[11px]'

  const bonus = bonusType ? BONUS_STYLES[bonusType] : null

  // Bonus color wins over selected yellow when on a premium square
  const bgColor = bonus ? bonus.bg : selected ? '#F0C040' : '#F5E6C8'
  const borderColor = bonus ? bonus.border : selected ? '#C8A000' : '#C8A96E'

  // Gold ring for "placed this turn" on normal cells; bonus-colored ring on premium cells
  const ringColor = bonus ? bonus.ring : selected ? '#C8A000' : null
  const boxShadow = ringColor
    ? `0 0 0 1.5px ${ringColor}, 0 2px 6px rgba(0,0,0,0.25)`
    : '0 2px 4px rgba(0,0,0,0.2)'

  // Rack tiles lift up on selection; board tiles (small) only scale slightly
  const animateState = selected
    ? small ? { y: -2, scale: 1.06 } : { y: -6, scale: 1.08 }
    : { y: 0, scale: 1 }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={onClick && !disabled ? { scale: 0.92 } : undefined}
      animate={animateState}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`
        relative ${size} rounded-md flex items-center justify-center
        font-bold font-serif select-none cursor-pointer border
        ${tile.isBlank ? 'italic' : ''}
        ${disabled ? 'opacity-50 cursor-default' : ''}
      `}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: '#2D1B0E',
        boxShadow: small
          ? `0 1px 0 #B89050, 0 1px 4px rgba(0,0,0,0.4), ${boxShadow}`
          : `0 1px 0 #B89050, 0 2px 0 #9A7035, 0 3px 8px rgba(0,0,0,0.5), ${boxShadow}`,
        textShadow: '0 1px 1px rgba(0,0,0,0.2)',
      }}
    >
      <span className="leading-none" style={{ color: tile.isBlank ? '#8B6914' : '#2D1B0E' }}>
        {letter}
      </span>
      {!tile.isBlank && (
        <span className={`absolute bottom-0.5 right-1 ${pointSize} font-normal opacity-70`}>
          {tile.points}
        </span>
      )}
      {/* Badge bonus — visible uniquement sur les grandes tuiles (rack) */}
      {bonus && !small && (
        <span
          className="absolute top-0 left-0 text-[9px] font-bold leading-none px-[2px] py-[1px] rounded-br-[3px] rounded-tl-[4px]"
          style={{ color: bonus.badgeColor, backgroundColor: `${bonus.badgeColor}25` }}
        >
          {bonus.badge}
        </span>
      )}
    </motion.button>
  )
}
