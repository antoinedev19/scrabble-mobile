import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RulesMode, GameMode, AIDifficulty } from '../game/types'

interface Props {
  onStart: (name1: string, name2: string, rulesMode: RulesMode, gameMode: GameMode, aiDifficulty: AIDifficulty) => void
  onResume: () => void
  hasSave: boolean
}

export default function GameMenu({ onStart, onResume, hasSave }: Props) {
  const [name1, setName1] = useState('Joueur 1')
  const [name2, setName2] = useState('Joueur 2')
  const [rulesMode, setRulesMode] = useState<RulesMode>('classic')
  const [gameMode, setGameMode] = useState<GameMode>('vsAI')
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('normal')

  const handleStart = () => {
    const p1 = name1.trim() || 'Joueur 1'
    const p2 = gameMode === 'vsAI' ? 'Jarvis (IA)' : (name2.trim() || 'Joueur 2')
    onStart(p1, p2, rulesMode, gameMode, aiDifficulty)
  }

  return (
    <div className="min-h-screen bg-[#1a0f06] flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-[#F5E6C8] font-serif mb-1">Scrabble</h1>
        <p className="text-[#C8A96E] text-sm tracking-widest uppercase">Édition Française</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-sm bg-[#2a1a0c] rounded-2xl p-6 shadow-2xl border border-[#8B6914]/30 space-y-5">
        {/* Mode */}
        <div>
          <span className="text-[#C8A96E] text-xs uppercase tracking-widest mb-2 block">Mode</span>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'vsAI', label: '🤖 Solo vs IA', desc: 'Joue contre Jarvis' },
              { value: '2players', label: '👥 2 joueurs', desc: 'Même téléphone' },
            ] as { value: GameMode; label: string; desc: string }[]).map(({ value, label, desc }) => (
              <button key={value} onClick={() => setGameMode(value)}
                className={`rounded-xl p-3 border text-left transition-all ${
                  gameMode === value ? 'bg-[#C8A96E]/20 border-[#C8A96E] text-[#F5E6C8]' : 'bg-[#1a0f06] border-[#8B6914]/30 text-[#8B6914]'
                }`}>
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs mt-0.5 opacity-70">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Joueurs */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-[#C8A96E] text-xs uppercase tracking-widest mb-1 block">Ton prénom</span>
            <input className="w-full bg-[#1a0f06] border border-[#8B6914]/50 rounded-xl px-4 py-3 text-[#F5E6C8] text-base focus:outline-none focus:border-[#C8A96E] transition-colors" value={name1} onChange={(e) => setName1(e.target.value)} maxLength={20} />
          </label>
          {gameMode === '2players' && (
            <motion.label initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="block overflow-hidden">
              <span className="text-[#C8A96E] text-xs uppercase tracking-widest mb-1 block">Joueur 2</span>
              <input className="w-full bg-[#1a0f06] border border-[#8B6914]/50 rounded-xl px-4 py-3 text-[#F5E6C8] text-base focus:outline-none focus:border-[#C8A96E] transition-colors" value={name2} onChange={(e) => setName2(e.target.value)} maxLength={20} />
            </motion.label>
          )}
        </div>

        {/* Difficulté IA */}
        {gameMode === 'vsAI' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <span className="text-[#C8A96E] text-xs uppercase tracking-widest mb-2 block">Difficulté IA</span>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'easy', label: '😌 Facile', desc: 'Coup aléatoire' },
                { value: 'normal', label: '🎯 Normal', desc: 'Top 5 coups' },
                { value: 'hard', label: '🔥 Difficile', desc: 'Meilleur coup' },
              ] as { value: AIDifficulty; label: string; desc: string }[]).map(({ value, label, desc }) => (
                <button key={value} onClick={() => setAiDifficulty(value)}
                  className={`rounded-xl p-2.5 border text-left transition-all ${
                    aiDifficulty === value ? 'bg-[#C8A96E]/20 border-[#C8A96E] text-[#F5E6C8]' : 'bg-[#1a0f06] border-[#8B6914]/30 text-[#8B6914]'
                  }`}>
                  <div className="font-semibold text-xs">{label}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{desc}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Règles */}
        <div>
          <span className="text-[#C8A96E] text-xs uppercase tracking-widest mb-2 block">Règles</span>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'casual', label: '😌 Détente', desc: 'Mots réels, sans bonus de cases' },
              { value: 'classic', label: '🏆 Classique', desc: 'Cases bonus + multiplicateurs' },
            ] as { value: RulesMode; label: string; desc: string }[]).map(({ value, label, desc }) => (
              <button key={value} onClick={() => setRulesMode(value as RulesMode)}
                className={`rounded-xl p-3 border text-left transition-all ${
                  rulesMode === value ? 'bg-[#C8A96E]/20 border-[#C8A96E] text-[#F5E6C8]' : 'bg-[#1a0f06] border-[#8B6914]/30 text-[#8B6914]'
                }`}>
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs mt-0.5 opacity-70">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Boutons */}
        <div className="space-y-2">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleStart} className="w-full bg-[#C8A96E] text-[#1a0f06] font-bold text-lg py-4 rounded-xl tracking-wide hover:bg-[#D4B97E] active:bg-[#B89050] transition-colors">
            Nouvelle partie
          </motion.button>
          {hasSave && (
            <motion.button initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }} onClick={onResume} className="w-full bg-transparent text-[#C8A96E] font-semibold text-base py-3 rounded-xl border border-[#C8A96E]/50 hover:bg-[#C8A96E]/10 active:bg-[#C8A96E]/20 transition-colors">
              ↩ Reprendre la partie
            </motion.button>
          )}
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-5 text-[#8B6914] text-xs text-center max-w-xs">
        Appuie sur une tuile du rack, puis sur une case du plateau pour la poser.
      </motion.p>
    </div>
  )
}