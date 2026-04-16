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
      <motion.button whileTap={{ scale: 0.96 }} onClick={onPass} className="flex-1 py-3 rounded-xl bg-[#2a1a0c] border border-[#8B6914]/40 text-[#8B6914] font-semibold text-sm active:brightness-110">Passer</motion.button>
      <motion.button whileTap={{ scale: 0.96 }} onClick={onExchange} disabled={!canExchange} className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-opacity ${canExchange ? 'bg-[#2a1a0c] border-[#8B6914]/40 text-[#C8A96E] active:brightness-110' : 'bg-[#2a1a0c] border-[#8B6914]/20 text-[#8B6914]/30 opacity-50'}`}>Échanger</motion.button>
      <motion.button whileTap={{ scale: 0.96 }} onClick={onValidate} disabled={!canValidate} className={`flex-[2] py-3 rounded-xl font-bold text-sm transition-all ${canValidate ? 'bg-[#C8A96E] text-[#1a0f06] active:bg-[#B89050]' : 'bg-[#C8A96E]/20 text-[#C8A96E]/40 cursor-not-allowed'}`}>Valider ✓</motion.button>
    </div>
  )
}