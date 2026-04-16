import type { Player } from '../game/types'

interface Props { players: [Player, Player]; currentPlayer: 0 | 1; bagCount: number }

export default function ScorePanel({ players, currentPlayer, bagCount }: Props) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {players.map((player, idx) => (
        <div key={player.id} className={`flex-1 rounded-xl px-3 py-2 transition-all ${currentPlayer === idx ? 'bg-[#C8A96E]/20 border border-[#C8A96E]/60' : 'bg-[#2a1a0c] border border-transparent'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium truncate ${currentPlayer === idx ? 'text-[#F5E6C8]' : 'text-[#8B6914]'}`}>
              {currentPlayer === idx && <span className="mr-1">▶</span>}{player.name}
            </span>
            <span className={`text-lg font-bold font-serif ml-2 ${currentPlayer === idx ? 'text-[#F5E6C8]' : 'text-[#8B6914]'}`}>{player.score}</span>
          </div>
        </div>
      ))}
      <div className="text-center bg-[#2a1a0c] rounded-xl px-3 py-2 border border-transparent min-w-[48px]">
        <div className="text-[#C8A96E] text-lg font-bold font-serif">{bagCount}</div>
        <div className="text-[#8B6914] text-[9px] uppercase tracking-wide">Sac</div>
      </div>
    </div>
  )
}