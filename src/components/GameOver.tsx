import { motion } from 'framer-motion'
import type { Player } from '../game/types'

interface Props { players: [Player, Player]; onPlayAgain: () => void; onMenu: () => void }

export default function GameOver({ players, onPlayAgain, onMenu }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const winner = sorted[0]
  const isDraw = sorted[0].score === sorted[1].score

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#1a0f06]/95 flex flex-col items-center justify-center p-6 z-50">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }} className="text-center">
        <div className="text-5xl mb-4">{isDraw ? '🤝' : '🏆'}</div>
        <h2 className="text-3xl font-bold text-[#F5E6C8] font-serif mb-1">{isDraw ? 'Égalité !' : `${winner.name} gagne !`}</h2>
        <p className="text-[#C8A96E] mb-8">Fin de la partie</p>
        <div className="bg-[#2a1a0c] rounded-2xl p-5 mb-8 w-full max-w-xs border border-[#8B6914]/30">
          {sorted.map((player, i) => (
            <div key={player.id} className={`flex items-center justify-between py-2 ${i === 0 ? 'text-[#F5E6C8]' : 'text-[#8B6914]'}`}>
              <span className="font-medium">{i === 0 && !isDraw ? '🥇 ' : ''}{player.name}</span>
              <span className="text-2xl font-bold font-serif">{player.score} pts</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onPlayAgain} className="w-full bg-[#C8A96E] text-[#1a0f06] font-bold py-4 rounded-xl text-lg">Rejouer</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onMenu} className="w-full bg-[#2a1a0c] border border-[#8B6914]/40 text-[#C8A96E] font-semibold py-3 rounded-xl">Menu</motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}