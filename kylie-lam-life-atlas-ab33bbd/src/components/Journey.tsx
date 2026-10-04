import { useState } from 'react'
import { MONTHLY_GOAL } from '../config/app.ts'
import { useAiKey } from '../game/ai.ts'
import { useGame } from '../game/context.ts'
import { useChime } from '../game/sound.ts'
import { completionsThisMonth, findTask, kingdomStatus, taskStats, visibleStreak } from '../game/logic.ts'
import { ConfirmDialog } from './ConfirmDialog.tsx'

export function Journey() {
  const game = useGame()
  const [confirming, setConfirming] = useState(false)
  const [today] = useState(() => new Date())
  const stats = taskStats(game.state.kingdoms)
  const monthCount = completionsThisMonth(game.state)
  const streak = visibleStreak(game.state)
  const charted = game.state.kingdoms.length
  const peaceful = game.state.kingdoms.filter((kingdom) => kingdomStatus(kingdom) === 'done').length
  const recent = [...game.state.completions].reverse().slice(0, 5)
  const [chime, setChime] = useChime()

  return (
    <div className="h-full overflow-auto px-4 py-4">
      <div className="mx-auto max-w-4xl">
        <p className="font-display text-xs tracking-[0.2em] text-burgundy">THE CHRONICLE</p>
        <h1 className="mt-1 font-display text-4xl text-ink">Where the road has taken you</h1>
        <p className="mt-2 max-w-2xl font-manuscript text-2xl italic leading-snug text-ink-soft">
          Level {game.level} · {game.levelTitle}. The map keeps the days you actually moved.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <section className="panel grid place-items-center p-5 text-center">
            <p className="font-display text-6xl leading-none text-burgundy">{game.level}</p>
            <p className="mt-2 font-display text-sm tracking-wide">{game.levelTitle}</p>
            <div className="mt-4 h-3 w-full border border-ink bg-[#efe2c4]">
              <div className="h-full bg-gold" style={{ width: `${(game.xpInto / game.xpNeed) * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              {game.xpInto} / {game.xpNeed} XP toward the next level
            </p>
            <p className="text-sm text-ink-soft">{game.state.xp} XP in all</p>
            <button type="button" className="ink-button mt-4" onClick={() => setChime(!chime)}>
              {chime ? 'Sound on' : 'Sound off'}
            </button>
            <p className="mt-2 text-xs text-ink-soft">The level-up chime, and the smaller coin and furnishing notes.</p>
          </section>

          <section className="panel p-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Row label="In your purse" value={`${game.state.coins} coins`} />
              <Row label="Earned on the road" value={`${game.state.lifetimeCoins} coins`} />
              <Row label="Current streak" value={streak === 1 ? '1 day' : `${streak} days`} />
              <Row label="Marks kept" value={`${stats.done} of ${stats.total}`} />
              <Row label="Lands charted" value={String(charted)} />
              <Row label="Lands at peace" value={`${peaceful} of ${charted}`} />
            </dl>

            <div className="mt-5 border-t border-ink/20 pt-4">
              <h2 className="font-display text-lg">This moon</h2>
              <p className="font-manuscript text-lg italic text-ink-soft">
                Mark {MONTHLY_GOAL} tasks. {monthCount} so far.
              </p>
              <div className="mt-2 flex flex-wrap gap-2" aria-hidden="true">
                {Array.from({ length: MONTHLY_GOAL }, (_, index) => (
                  <span
                    key={index}
                    className={`inline-block h-4 w-4 rotate-45 border border-ink ${index < monthCount ? 'bg-gold' : 'bg-[#efe2c4]'}`}
                  />
                ))}
              </div>
              {monthCount >= MONTHLY_GOAL && (
                <p className="mt-2 font-manuscript text-lg text-burgundy">The moon&apos;s goal is met.</p>
              )}
            </div>
          </section>
        </div>

        <GuideKey />

        <section className="panel mt-4 p-5">
          <h2 className="font-display text-xl">The month, day by day</h2>
          <p className="font-manuscript text-lg italic text-ink-soft">A gold day is a day you completed a task.</p>
          <MonthCalendar dates={new Set(game.state.completions.map((entry) => entry.date))} now={today} />
        </section>

        <section className="panel mt-4 p-5">
          <h2 className="font-display text-xl">Latest marks</h2>
          {recent.length === 0 ? (
            <p className="mt-2 font-manuscript text-lg italic">No marks yet. The calendar fills when you complete a task.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {recent.map((entry) => {
                const found = findTask(game.state, entry.taskId)
                return (
                  <li key={`${entry.taskId}-${entry.date}`} className="flex gap-3 text-sm">
                    <span className="w-24 shrink-0 font-display text-xs tracking-wide text-ink-soft">{entry.date}</span>
                    <span>
                      {found ? `${found.task.label} · ${found.kingdom.generatedName}` : 'A finished quest'}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 pt-4">
          <p className="max-w-md text-sm text-ink-soft">Saved on this device. Beginning anew clears quests, coins, and the hall.</p>
          <button type="button" className="ink-button solid" onClick={() => setConfirming(true)}>
            Burn this map & begin anew
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Burn this map?"
          body="Quests, coins, the streak, and everything placed in the hall will be gone. The blank page comes back."
          confirmLabel="Begin anew"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            game.reset()
          }}
        />
      )}
    </div>
  )
}

function GuideKey() {
  const [saved, setSaved] = useAiKey()
  const [draft, setDraft] = useState(saved)
  const [status, setStatus] = useState('')

  return (
    <section className="panel mt-4 p-5">
      <h2 className="font-display text-xl">A guide for each quest</h2>
      <p className="mt-1 max-w-2xl text-sm leading-snug text-ink-soft">
        Paste an OpenAI key. It stays in this browser. Help me start and Ask the Scribe send it to this app, which calls OpenAI. Without a key, the shelf and the local scribe still answer. Burning the map does not remove it.
      </p>
      <label className="mt-3 block font-display text-[10px] tracking-[0.14em] text-ink-soft" htmlFor="ai-key">
        OpenAI key
      </label>
      <input
        id="ai-key"
        className="ink-line mt-1 max-w-xl"
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={draft}
        placeholder="sk-…"
        onChange={(event) => setDraft(event.target.value)}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="ink-button solid"
          onClick={() => {
            const next = draft.trim()
            setSaved(next)
            setDraft(next)
            setStatus(next ? 'Key kept on this device.' : 'Key removed. The shelf and the local scribe will answer.')
          }}
        >
          Keep this key
        </button>
        {saved && (
          <button
            type="button"
            className="ink-button"
            onClick={() => {
              setSaved('')
              setDraft('')
              setStatus('Key removed. The shelf and the local scribe will answer.')
            }}
          >
            Remove key
          </button>
        )}
      </div>
      {saved && !status && (
        <p className="mt-2 text-sm text-ink-soft">A key is saved on this device. Help me start and Ask the Scribe will use it.</p>
      )}
      {status && <p className="mt-2 text-sm text-burgundy">{status}</p>}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-soft">{label}</dt>
      <dd className="font-display text-lg leading-tight">{value}</dd>
    </div>
  )
}

function MonthCalendar({ dates, now }: { dates: Set<string>; now: Date }) {
  const year = now.getFullYear()
  const month = now.getMonth()
  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()
  const blanks = first.getDay()
  const monthName = first.toLocaleString(undefined, { month: 'long', year: 'numeric' })
  const today = now.getDate()
  const cells: (number | null)[] = [...Array<null>(blanks).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]

  return (
    <div className="mt-3">
      <p className="font-manuscript text-2xl">{monthName}</p>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wider text-ink-soft">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) return <div key={`blank-${index}`} />
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const active = dates.has(key)
          const isToday = day === today
          return (
            <div
              key={key}
              className={`grid h-10 place-items-center border border-ink/20 font-display text-sm ${
                active ? 'bg-gold-lite' : 'bg-[#f7edd6]'
              } ${isToday ? 'ring-2 ring-burgundy ring-inset' : ''}`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
