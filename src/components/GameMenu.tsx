import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RulesMode, GameMode, AIDifficulty } from '../game/types'

interface Props {
  onStart: (name1: string, name2: string, rulesMode: RulesMode, gameMode: GameMode, aiDifficulty: AIDifficulty) => void
  onResume: () => void
  hasSave: boolean
}

function OptionButton({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean
  onClick: () => void
  label: string
  desc: string
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-3 border text-left transition-all relative"
      style={{
        background: active ? 'rgba(200,169,110,0.18)' : 'rgba(20,16,10,0.8)',
        borderColor: active ? '#C8A96E' : 'rgba(139,105,20,0.25)',
        color: active ? '#F5E6C8' : '#7A5C20',
      }}
    >
      {active && (
        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full" style={{ background: '#C8A96E' }} />
      )}
      <div className="font-semibold text-sm font-sans pr-4">{label}</div>
      <div className="text-xs mt-0.5 opacity-60 font-sans">{desc}</div>
    </button>
  )
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
    <div className="min-h-screen bg-scrabble-base flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h1 className="font-black tracking-tight text-scrabble-cream font-serif mb-2" style={{ fontSize: 'clamp(2.25rem, 8vw, 3.75rem)' }}>
          Scrabble
        </h1>
        <p className="text-scrabble-gold text-xs tracking-[0.35em] uppercase font-sans font-medium">
          Édition Française
        </p>
      </motion.div>

      {/* Carte formulaire */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-[min(28rem,calc(100%-1.5rem))] bg-scrabble-card rounded-2xl px-4 py-5 shadow-2xl border border-scrabble-gold-dark/25 space-y-5"
      >
        {/* Mode de jeu */}
        <div>
          <span className="text-scrabble-gold text-[10px] uppercase tracking-[0.2em] mb-2.5 block font-sans font-medium">
            Mode
          </span>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'vsAI',      label: 'Solo vs IA',  desc: 'Joue contre Jarvis' },
              { value: '2players',  label: '2 joueurs',   desc: 'Même téléphone' },
            ] as { value: GameMode; label: string; desc: string }[]).map(({ value, label, desc }) => (
              <OptionButton
                key={value}
                active={gameMode === value}
                onClick={() => setGameMode(value)}
                label={label}
                desc={desc}
              />
            ))}
          </div>
        </div>

        {/* Joueurs */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-scrabble-gold text-[10px] uppercase tracking-[0.2em] mb-1.5 block font-sans font-medium">
              Ton prénom
            </span>
            <input
              className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors font-sans"
              style={{ background: '#14100A', border: '1px solid rgba(139,105,20,0.4)', color: '#F5E6C8' }}
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              maxLength={20}
            />
          </label>
          {gameMode === '2players' && (
            <motion.label
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="block overflow-hidden"
            >
              <span className="text-scrabble-gold text-[10px] uppercase tracking-[0.2em] mb-1.5 block font-sans font-medium">
                Joueur 2
              </span>
              <input
                className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors font-sans"
                style={{ background: '#14100A', border: '1px solid rgba(139,105,20,0.4)', color: '#F5E6C8' }}
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                maxLength={20}
              />
            </motion.label>
          )}
        </div>

        {/* Difficulté IA */}
        {gameMode === 'vsAI' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <span className="text-scrabble-gold text-[10px] uppercase tracking-[0.2em] mb-2.5 block font-sans font-medium">
              Difficulté IA
            </span>
            <div className="flex flex-col gap-2">
              {([
                { value: 'easy',   label: 'Facile',    desc: 'Coup aléatoire' },
                { value: 'normal', label: 'Normal',    desc: 'Top 5 coups' },
                { value: 'hard',   label: 'Difficile', desc: 'Meilleur coup' },
              ] as { value: AIDifficulty; label: string; desc: string }[]).map(({ value, label, desc }) => (
                <OptionButton
                  key={value}
                  active={aiDifficulty === value}
                  onClick={() => setAiDifficulty(value)}
                  label={label}
                  desc={desc}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Règles */}
        <div>
          <span className="text-scrabble-gold text-[10px] uppercase tracking-[0.2em] mb-2.5 block font-sans font-medium">
            Règles
          </span>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'casual',  label: 'Détente',   desc: 'Mots réels, sans bonus de cases' },
              { value: 'classic', label: 'Classique', desc: 'Cases bonus + multiplicateurs' },
            ] as { value: RulesMode; label: string; desc: string }[]).map(({ value, label, desc }) => (
              <OptionButton
                key={value}
                active={rulesMode === value}
                onClick={() => setRulesMode(value as RulesMode)}
                label={label}
                desc={desc}
              />
            ))}
          </div>
        </div>

        {/* Boutons */}
        <div className="space-y-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="w-full bg-scrabble-gold text-scrabble-brown font-bold text-base py-4 rounded-2xl tracking-wide hover:bg-scrabble-gold-light active:bg-[#B89050] transition-colors font-sans shadow-lg"
            style={{ boxShadow: '0 4px 14px rgba(200,169,110,0.35)' }}
          >
            Nouvelle partie
          </motion.button>
          {hasSave && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={onResume}
              className="w-full bg-transparent text-scrabble-gold font-medium text-sm py-3 rounded-2xl border border-scrabble-gold/40 hover:bg-scrabble-gold/10 active:bg-scrabble-gold/20 transition-colors font-sans"
            >
              ↩ Reprendre la partie
            </motion.button>
          )}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-scrabble-gold-dark text-sm text-center max-w-xs font-sans"
      >
        Appuie sur une tuile du rack, puis sur une case du plateau pour la poser.
      </motion.p>
    </div>
  )
}
