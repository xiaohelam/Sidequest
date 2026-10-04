import { useEffect, useState } from 'react'
import { useGame } from '../game/context.ts'
import { levelProgress } from '../game/logic.ts'
import { useChime } from '../game/sound.ts'

const SPARKS = [
  { x: '12%', y: '18%', dx: '-70px', dy: '-80px', delay: '0.05s' },
  { x: '22%', y: '72%', dx: '-40px', dy: '90px', delay: '0.15s' },
  { x: '78%', y: '16%', dx: '80px', dy: '-70px', delay: '0.1s' },
  { x: '84%', y: '68%', dx: '90px', dy: '60px', delay: '0.22s' },
  { x: '48%', y: '8%', dx: '0px', dy: '-100px', delay: '0s' },
  { x: '8%', y: '46%', dx: '-110px', dy: '10px', delay: '0.28s' },
  { x: '90%', y: '42%', dx: '100px', dy: '-8px', delay: '0.18s' },
  { x: '36%', y: '86%', dx: '-20px', dy: '90px', delay: '0.32s' },
  { x: '64%', y: '88%', dx: '24px', dy: '96px', delay: '0.08s' },
  { x: '30%', y: '28%', dx: '-50px', dy: '-40px', delay: '0.4s' },
  { x: '70%', y: '30%', dx: '54px', dy: '-36px', delay: '0.36s' },
  { x: '50%', y: '78%', dx: '6px', dy: '70px', delay: '0.24s' },
]

/**
 * A single illuminated page when the hero's level increases.
 * Closing it leaves the player on the same screen.
 */
export function LevelUp() {
  const game = useGame()
  const moment = game.levelUp
  const momentId = moment ? `${moment.from}-${moment.to}-${moment.xpGained}` : ''
  const [seenMoment, setSeenMoment] = useState(momentId)
  const [ready, setReady] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [chime, setChime] = useChime()

  if (momentId !== seenMoment) {
    setSeenMoment(momentId)
    setReady(false)
    setShowNext(false)
  }

  useEffect(() => {
    if (!momentId) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const swap = window.setTimeout(() => setShowNext(true), reduce ? 0 : 900)
    const timer = window.setTimeout(() => setReady(true), reduce ? 400 : 2400)
    return () => {
      window.clearTimeout(swap)
      window.clearTimeout(timer)
    }
  }, [momentId])

  useEffect(() => {
    if (!moment || !ready) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') game.dismissLevelUp()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [moment, ready, game])

  useEffect(() => {
    if (!ready) return
    document.getElementById('level-up-continue')?.focus()
  }, [ready])

  if (!moment) return null

  const title = levelProgress((moment.to - 1) * game.xpNeed).title
  const jumped = moment.to - moment.from > 1

  return (
    <div className="levelup-dim" data-level-up role="dialog" aria-modal="true" aria-labelledby="level-up-title">
      <div className="levelup-glow" aria-hidden="true" />
      <div className="levelup-sparks" aria-hidden="true">
        {SPARKS.map((spark) => (
          <span
            key={`${spark.x}-${spark.y}`}
            className="levelup-spark"
            style={{
              left: spark.x,
              top: spark.y,
              animationDelay: spark.delay,
              ['--dx' as string]: spark.dx,
              ['--dy' as string]: spark.dy,
            }}
          />
        ))}
      </div>
      <article className="levelup-frame">
        <Flourishes />
        <p className="levelup-kicker">✦ Level up ✦</p>
        <h2 id="level-up-title" className="levelup-title">
          Level up
        </h2>
        <p className={`levelup-count ${showNext ? 'is-next' : ''}`} aria-live="polite">
          Level {showNext ? moment.to : moment.from}
        </p>
        <p className="levelup-rank">{title}</p>
        <p className="levelup-line">{jumped ? 'Several chapters, in one deed.' : 'Your journey grows.'}</p>
        <p className="levelup-reward">
          A new chapter of the road
          <span> Earned +{moment.xpGained} XP</span>
        </p>
        <div className="levelup-actions">
          <button
            id="level-up-continue"
            type="button"
            className={`ink-button solid levelup-continue ${ready ? 'is-ready' : ''}`}
            disabled={!ready}
            onClick={game.dismissLevelUp}
          >
            Continue
          </button>
          <button type="button" className="link-ink levelup-mute" onClick={() => setChime(!chime)}>
            {chime ? 'Sound on' : 'Sound off'}
          </button>
        </div>
      </article>
    </div>
  )
}

function Flourishes() {
  return (
    <svg className="levelup-ornament" viewBox="0 0 360 28" aria-hidden="true">
      <path
        d="M8 18 C40 18 48 6 70 8 C88 10 96 18 120 16 M240 16 C264 18 272 10 290 8 C312 6 320 18 352 18"
        fill="none"
        stroke="#b8923a"
        strokeWidth="1.4"
      />
      <path d="M168 16 L176 8 L184 16 L176 22 Z" fill="#e6c56a" stroke="#3a2714" strokeWidth="0.8" />
      <circle cx="150" cy="16" r="2" fill="#7a3142" />
      <circle cx="202" cy="16" r="2" fill="#7a3142" />
    </svg>
  )
}
