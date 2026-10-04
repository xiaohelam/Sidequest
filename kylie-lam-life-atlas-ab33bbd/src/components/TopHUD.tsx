import { useEffect, useRef, useState } from 'react'
import { APP_NAME } from '../config/app.ts'
import { useGame } from '../game/context.ts'
import { CoinIcon, TorchIcon } from './icons.tsx'

export function TopHUD() {
  const game = useGame()
  const [pop, setPop] = useState(false)
  const seen = useRef(game.state.coins)

  useEffect(() => {
    if (game.state.coins !== seen.current) {
      setPop(true)
      seen.current = game.state.coins
      const timer = window.setTimeout(() => setPop(false), 380)
      return () => window.clearTimeout(timer)
    }
  }, [game.state.coins])

  const xpPct = Math.round((game.xpInto / game.xpNeed) * 100)
  const [gleam, setGleam] = useState(false)
  const seenPulse = useRef(game.levelPulse)

  useEffect(() => {
    if (game.levelPulse === seenPulse.current) return
    seenPulse.current = game.levelPulse
    setGleam(true)
    const timer = window.setTimeout(() => setGleam(false), 2200)
    return () => window.clearTimeout(timer)
  }, [game.levelPulse])

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
      <p className="font-display text-lg tracking-[0.18em] text-ink">{APP_NAME}</p>
      <div className="flex flex-wrap items-center gap-2">
        <div
          id="coin-target"
          className={`flex items-center gap-2 border border-ink/40 bg-parchment px-2.5 py-1 ${pop ? 'purse-pop' : ''}`}
          aria-live="polite"
        >
          <CoinIcon />
          <div>
            <p className="font-display text-sm leading-none">{game.state.coins}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-soft">Coins</p>
          </div>
        </div>
        <div className="flex items-center gap-2 border border-ink/40 bg-parchment px-2.5 py-1">
          <TorchIcon />
          <div>
            <p className="font-display text-sm leading-none">{game.streak}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-soft">Day streak</p>
          </div>
        </div>
        <div className="flex items-center gap-2 border border-ink/40 bg-parchment px-2.5 py-1">
          <Shield level={game.level} gleam={gleam} />
          <div className="min-w-0">
            <p className="font-display text-xs leading-tight">{game.levelTitle}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-soft">Level {game.level}</p>
          </div>
        </div>
        <div className="border border-ink/40 bg-parchment px-2.5 py-1">
          <div className="h-2 w-28 border border-ink bg-[#efe2c4]" aria-hidden="true">
            <div className="h-full bg-gold" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-soft">
            {game.xpInto}/{game.xpNeed} XP
          </p>
        </div>
      </div>
    </header>
  )
}

function Shield({ level, gleam }: { level: number; gleam: boolean }) {
  return (
    <svg viewBox="0 0 24 28" className={`h-7 w-6 ${gleam ? 'shield-gleam' : ''}`} aria-hidden="true">
      <path d="M12 1 L22 5 V14 C22 20 17 25 12 27 C7 25 2 20 2 14 V5 Z" fill="#7a3142" stroke="#3a2714" strokeWidth="1.4" />
      {level >= 2 && <circle cx="12" cy="7.2" r="1.15" fill="#e6c56a" />}
      <text x="12" y="18" textAnchor="middle" fontSize="10" fill="#f6edd8" fontFamily="Cinzel, Palatino, serif">
        {level}
      </text>
    </svg>
  )
}
