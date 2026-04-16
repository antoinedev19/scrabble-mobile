import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TilePiece } from '../game/types'
import TilePieceComponent from './TilePiece'

interface Props { open: boolean; rack: TilePiece[]; onConfirm: (indices: number[]) => void; onCancel: () => void }

export default function ExchangeModal({ open, rack, onConfirm, onCancel }: Props) {
  const [selected, setSelected] = useState<number[]>([])
  const toggle = (idx: number) => setSelected((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx])
  const handleConfirm = () => { if (selected.length === 0) return; onConfirm(selected); setSelected([]) }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4" onClick={onCancel}>
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-[#2a1a0c] rounded-2xl p-5 border border-[#8B6914]/40">
            <h3 className="text-[#F5E6C8] font-semibold text-center mb-1">Échanger des tuiles</h3>
            <p className="text-[#8B6914] text-xs text-center mb-4">Sélectionne les tuiles à rendre</p>
            <div className="flex justify-center gap-2 mb-5">
              {rack.map((tile, idx) => <TilePieceComponent key={tile.id} tile={tile} selected={selected.includes(idx)} onClick={() => toggle(idx)} />)}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} disabled={selected.length === 0} className={`w-full py-3 rounded-xl font-bold mb-2 ${selected.length > 0 ? 'bg-[#C8A96E] text-[#1a0f06]' : 'bg-[#C8A96E]/20 text-[#C8A96E]/40'}`}>
              Échanger {selected.length > 0 ? `${selected.length} tuile(s)` : ''}
            </motion.button>
            <button onClick={onCancel} className="w-full text-[#8B6914] text-sm py-2">Annuler</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}