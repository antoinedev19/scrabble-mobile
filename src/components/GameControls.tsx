import { motion } from 'framer-motion'

interface Props {
  onValidate: () => void
  onPass: () => void
  onExchange: () => void
  canValidate: boolean
  canExchange: boolean
}

export default function GameControls({ onValidate, onPass, onExchange, canValidate, canExchange }: Props) {
  return (
    <div className="flex gap-2 px-3 pb-3">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onPass}
        className="flex-1 py-3.5 rounded-2xl bg-scrabble-hover border border-scrabble-gold-dark/35 text-scrabble-gold-dark font-medium text-sm font-sans active:brightness-110 transition-all"
      >
        Passer
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onExchange}
        disabled={!canExchange}
        className={`flex-1 py-3.5 rounded-2xl border font-medium text-sm font-sans transition-all ${
          canExchange
            ? 'bg-scrabble-hover border-scrabble-gold-dark/35 text-scrabble-cream active:brightness-110'
            : 'bg-scrabble-hover border-scrabble-gold-dark/15 text-scrabble-gold-dark/30 opacity-40'
        }`}
      >
        Échanger
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onValidate}
        disabled={!canValidate}
        className={`flex-[2] py-3.5 rounded-2xl font-bold text-sm font-sans tracking-wide transition-all ${
          canValidate
            ? 'text-scrabble-brown active:opacity-90'
            : 'bg-scrabble-gold/15 text-scrabble-gold/35 cursor-not-allowed'
        }`}
        style={canValidate ? {
          background: 'linear-gradient(135deg, #D4B97E 0%, #C8A96E 50%, #B89050 100%)',
          boxShadow: '0 2px 10px rgba(200,169,110,0.3)',
        } : undefined}
      >
        Valider ✓
      </motion.button>
    </div>
  )
}
