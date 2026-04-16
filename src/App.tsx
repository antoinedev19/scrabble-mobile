import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from './hooks/useGame'
import type { RulesMode, GameMode, AIDifficulty } from './game/types'
import GameMenu from './components/GameMenu'
import GameScreen from './components/GameScreen'

export default function App() {
  const {
    state,
    selectedRackIdx,
    isAIThinking,
    pendingBlank,
    hasSavedGame,
    resumeSavedGame,
    startGame,
    returnToMenu,
    selectRackTile,
    placeTile,
    recallTile,
    recallAllTiles,
    validateMove,
    passTurn,
    exchangeTiles,
    confirmBlankLetter,
    cancelBlank,
  } = useGame()

  const handleStart = (name1: string, name2: string, rulesMode: RulesMode, gameMode: GameMode, aiDifficulty: AIDifficulty) => {
    startGame(name1, name2, rulesMode, gameMode, aiDifficulty)
  }

  const handlePlayAgain = () => {
    if (!state) return
    startGame(state.players[0].name, state.players[1].name, state.rulesMode, state.gameMode, state.aiDifficulty)
  }

  return (
    <AnimatePresence mode="wait">
      {!state ? (
        <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <GameMenu onStart={handleStart} onResume={resumeSavedGame} hasSave={hasSavedGame()} />
        </motion.div>
      ) : (
        <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <GameScreen
            state={state}
            selectedRackIdx={selectedRackIdx}
            isAIThinking={isAIThinking}
            pendingBlank={pendingBlank}
            onSelectRack={selectRackTile}
            onPlaceTile={placeTile}
            onRecallTile={recallTile}
            onRecallAll={recallAllTiles}
            onValidate={validateMove}
            onPass={passTurn}
            onExchange={exchangeTiles}
            onConfirmBlank={confirmBlankLetter}
            onCancelBlank={cancelBlank}
            onPlayAgain={handlePlayAgain}
            onMenu={returnToMenu}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}