import type { TilePiece as TilePieceType } from '../game/types'
import TilePiece from './TilePiece'

interface Props { rack: TilePieceType[]; selectedIdx: number | null; onSelect: (idx: number) => void }

export default function PlayerRack({ rack, selectedIdx, onSelect }: Props) {
  return (
    <div className="flex items-end justify-center gap-1.5 px-2 py-2 min-h-[56px]">
      {rack.map((tile, idx) => (
        <TilePiece key={tile.id} tile={tile} selected={selectedIdx === idx} onClick={() => onSelect(idx)} />
      ))}
      {Array.from({ length: 7 - rack.length }).map((_, i) => (
        <div key={`empty-${i}`} className="w-11 h-11 rounded-md border border-dashed border-[#8B6914]/30" />
      ))}
    </div>
  )
}