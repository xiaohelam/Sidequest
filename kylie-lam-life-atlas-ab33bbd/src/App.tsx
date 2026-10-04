/**
 * Sidequest has two phases:
 * 1. Onboarding — blurt out ideas, one per line.
 * 2. The realm — map, quests, homebase, and journey.
 * Saved progress lives in GameProvider.
 */

import { useEffect, useState } from 'react'
import { CoinFlight } from './components/CoinFlight.tsx'
import { LevelUp } from './components/LevelUp.tsx'
import { Homebase } from './components/Homebase.tsx'
import { Journey } from './components/Journey.tsx'
import { NavHUD } from './components/NavHUD.tsx'
import { Onboarding } from './components/Onboarding.tsx'
import { QuestList } from './components/QuestList.tsx'
import { QuestPanel } from './components/QuestPanel.tsx'
import { Toolkit } from './components/Toolkit.tsx'
import { TopHUD } from './components/TopHUD.tsx'
import { WorldMap } from './components/map/WorldMap.tsx'
import { useGame } from './game/context.ts'
import { GameProvider } from './game/GameContext.tsx'

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  )
}

function Shell() {
  const game = useGame()
  const [charting, setCharting] = useState(false)
  const onboarded = game.state.onboarded
  const [seenOnboarded, setSeenOnboarded] = useState(onboarded)

  if (onboarded !== seenOnboarded) {
    setSeenOnboarded(onboarded)
    if (onboarded) setCharting(true)
  }

  useEffect(() => {
    if (!charting) return
    const timer = window.setTimeout(() => setCharting(false), 950)
    return () => window.clearTimeout(timer)
  }, [charting])

  if (!onboarded) return <Onboarding />

  return (
    <div className="app-shell relative flex h-full flex-col">
      <TopHUD />
      <main className="relative min-h-0 flex-1">
        {game.view === 'map' && (
          <div className="flex h-full">
            <div className="relative min-w-0 flex-1">
              <WorldMap />
            </div>
            {game.openPlaceId && (
              <div className="absolute inset-0 z-30 bg-[#e7d3a4] p-3 md:static md:z-auto md:w-[min(440px,46%)] md:shrink-0 md:bg-transparent md:p-0 md:py-3 md:pr-3">
                <QuestPanel placeId={game.openPlaceId} />
              </div>
            )}
          </div>
        )}
        {game.view === 'quests' && <QuestList />}
        {game.view === 'toolkit' && <Toolkit />}
        {game.view === 'homebase' && <Homebase />}
        {game.view === 'journey' && <Journey />}
      </main>
      <NavHUD />
      <CoinFlight />
      {charting && <Charting />}
      <LevelUp />
    </div>
  )
}

function Charting() {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-parchment-deep">
      <div className="text-center">
        <svg width="72" height="72" viewBox="0 0 72 72" className="spin-slow mx-auto" aria-hidden="true">
          <circle cx="36" cy="36" r="28" fill="#f6edd8" stroke="#3a2714" strokeWidth="2" />
          <path d="M36 12 L42 36 L36 60 L30 36 Z" fill="#7a3142" stroke="#3a2714" />
          <circle cx="36" cy="36" r="3" fill="#e6c56a" />
        </svg>
        <p className="mt-3 font-manuscript text-2xl italic text-ink">Your world expands…</p>
      </div>
    </div>
  )
}
