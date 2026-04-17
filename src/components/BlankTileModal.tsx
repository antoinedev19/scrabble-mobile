import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface Props {
  open: boolean
  onSelect: (letter: string) => void
  onCancel: () => void
}

export default function BlankTileModal({ open, onSelect, onCancel }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#2a1a0c] rounded-2xl p-5 border border-[#8B6914]/40"
          >
            <h3 className="text-[#F5E6C8] font-semibold text-center mb-4">
              Joker — Choisis une lettre
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {ALPHABET.map((letter) => (
                <motion.button
                  key={letter}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSelect(letter)}
                  className="aspect-square flex items-center justify-center rounded-lg bg-[#F5E6C8] text-[#2D1B0E] font-bold text-base font-serif"
                >
                  {letter}
                </motion.button>
              ))}
            </div>
            <button
              onClick={onCancel}
              className="mt-4 w-full text-[#8B6914] text-sm py-2"
            >
              Annuler
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
