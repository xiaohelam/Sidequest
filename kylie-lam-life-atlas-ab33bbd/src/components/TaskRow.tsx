import { useEffect, useRef, useState } from 'react'
import { aiUnconfigured, aiWillAnswer, draftSupplies, getAiKey } from '../game/ai.ts'
import { useGame } from '../game/context.ts'
import { curateSupplies, kitTitle, supplyFingerprint, withRememberedState, type SupplyQuery } from '../game/resources.ts'
import type { Priority, Task } from '../game/types.ts'
import { CoinIcon } from './icons.tsx'
import { QuestSupplies } from './QuestSupplies.tsx'

const MARKS: Record<Priority, { label: string; marks: string; tone: string }> = {
  high: { label: 'High', marks: '★★★', tone: 'text-burgundy' },
  medium: { label: 'Medium', marks: '★★', tone: 'text-[#8a6230]' },
  low: { label: 'Low', marks: '★', tone: 'text-moss' },
}

export function TaskRow({
  kingdomId,
  task,
  index,
  fresh = false,
  onComplete,
  onEdit,
  onRemove,
  onDragStart,
  onDrop,
}: {
  kingdomId: string
  task: Task
  index: number
  fresh?: boolean
  onComplete: (origin: { x: number; y: number }) => void
  onEdit?: () => void
  onRemove?: () => void
  onDragStart?: () => void
  onDrop?: () => void
}) {
  const game = useGame()
  const kingdom = game.state.kingdoms.find((item) => item.id === kingdomId)
  const wasDone = useRef(task.done)
  const [pop, setPop] = useState(false)
  const [open, setOpen] = useState(fresh)
  const [showPath, setShowPath] = useState(false)
  const [tucked, setTucked] = useState(false)
  const [reading, setReading] = useState(false)
  const [note, setNote] = useState('')
  const alive = useRef(true)
  const mark = MARKS[task.priority]

  useEffect(() => {
    if (!wasDone.current && task.done) {
      setPop(true)
      const timer = window.setTimeout(() => setPop(false), 800)
      wasDone.current = true
      return () => window.clearTimeout(timer)
    }
    wasDone.current = task.done
  }, [task.done])

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  async function ask() {
    if (!kingdom || reading) return
    setTucked(false)
    setOpen(true)
    setShowPath(true)
    const aiKey = getAiKey()
    const useModel = await aiWillAnswer(aiKey)
    const mode = useModel ? 'ai' : 'shelf'
    const key = supplyFingerprint(task.label, task.description, mode)
    if (task.supplyKey === key && task.resources.length > 0 && task.startPath.length > 0) {
      setNote('')
      return
    }
    const usedUrls = kingdom.tasks
      .filter((item) => item.id !== task.id)
      .flatMap((item) => item.resources.map((resource) => resource.url).filter((url): url is string => Boolean(url)))
    const query: SupplyQuery = {
      idea: kingdom.originalIdea,
      kingdomName: kingdom.generatedName,
      kingdomDescription: kingdom.description,
      category: kingdom.category,
      motif: kingdom.motif,
      questLabel: task.label,
      questDescription: task.description,
      priority: task.priority,
      minutes: task.minutes,
      usedUrls,
    }
    if (!useModel) {
      const bundle = curateSupplies(query)
      game.setSupplies(kingdom.id, task.id, {
        supplyKey: key,
        resources: withRememberedState(task.resources, bundle.resources),
        startPath: bundle.startPath,
      })
      setNote('')
      return
    }
    setReading(true)
    setNote('')
    try {
      const bundle = await draftSupplies(query, aiKey)
      if (!alive.current) return
      game.setSupplies(kingdom.id, task.id, {
        supplyKey: key,
        resources: withRememberedState(task.resources, bundle.resources),
        startPath: bundle.startPath,
      })
    } catch (error) {
      if (!alive.current) return
      const bundle = curateSupplies(query)
      game.setSupplies(kingdom.id, task.id, {
        supplyKey: supplyFingerprint(task.label, task.description, 'shelf'),
        resources: withRememberedState(task.resources, bundle.resources),
        startPath: bundle.startPath,
      })
      if (!aiUnconfigured(error)) {
        const message = error instanceof Error && error.message ? error.message : 'The AI guide could not answer.'
        setNote(`${message} The shelf answered instead.`)
      }
    } finally {
      if (alive.current) setReading(false)
    }
  }

  return (
    <li
      className="quest-link relative flex flex-wrap items-start gap-2 py-2.5 pl-3"
      draggable={Boolean(onDragStart) && !task.done}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        onDragStart?.()
      }}
      onDragOver={(event) => {
        if (onDrop) event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDrop?.()
      }}
    >
      <span className="w-4 pt-1 font-display text-[10px] text-ink-soft" aria-hidden="true">
        {index + 1}
      </span>
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? `${task.label}, completed` : `Complete: ${task.label}`}
        disabled={task.done}
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center border-2 border-ink bg-[#f7edd6] disabled:cursor-default"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          onComplete({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
        }}
      >
        {task.done && (
          <svg viewBox="0 0 16 16" className="check-pop h-4 w-4" aria-hidden="true">
            <path d="M3 8.5 L6.5 12 L13 4" fill="none" stroke="#3a2714" strokeWidth="2.2" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-[15px] leading-snug ${task.done ? 'text-ink-soft line-through' : 'text-ink'}`}>{task.label}</p>
        {task.description && !task.done && <p className="font-manuscript text-base italic leading-snug text-ink-soft">{task.description}</p>}
        <p className={`font-display text-[10px] tracking-wide ${mark.tone}`}>
          {mark.marks} {mark.label}
          {task.deadline ? ` · ${task.deadline}` : ''}
          {task.minutes ? ` · ${task.minutes} min` : ''}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`flex items-center gap-1 font-display text-sm ${task.done ? 'text-ink-soft' : 'text-ink'}`}>
          <CoinIcon className="h-4 w-4" />+{task.coins}
        </span>
        {!task.done && onEdit && (
          <button type="button" className="link-ink text-sm" onClick={onEdit}>
            Revise
          </button>
        )}
        {!task.done && onRemove && (
          <button type="button" className="link-ink text-sm" onClick={onRemove}>
            Let go
          </button>
        )}
      </div>
      {kingdom && (
        <div className="col-span-full basis-full pl-6">
          {fresh && <p className="mt-1 font-display text-[10px] tracking-[0.14em] text-burgundy">Quest added</p>}
          {tucked ? (
            <button type="button" className="link-ink mt-1 text-sm" onClick={() => void ask()} disabled={reading}>
              {reading ? 'Reading this quest…' : 'Show Help me start'}
            </button>
          ) : (
            <>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button type="button" className="ink-button solid" onClick={() => void ask()} disabled={reading}>
                  {reading ? 'Reading this quest…' : 'Help me start'}
                </button>
                <button
                  type="button"
                  className="link-ink text-sm"
                  onClick={() => {
                    setTucked(true)
                    setOpen(false)
                  }}
                >
                  Tuck away
                </button>
              </div>
              {note && <p className="mt-2 text-sm leading-snug text-burgundy">{note}</p>}
              {reading && task.resources.length === 0 && (
                <p className="mt-2 font-manuscript text-lg italic text-ink-soft">Reading this quest…</p>
              )}
              {open && task.resources.length > 0 && (
                <QuestSupplies
                  kit={kitTitle({
                    idea: kingdom.originalIdea,
                    kingdomName: kingdom.generatedName,
                    kingdomDescription: kingdom.description,
                    category: kingdom.category,
                    motif: kingdom.motif,
                    questLabel: task.label,
                    questDescription: task.description,
                    priority: task.priority,
                    minutes: task.minutes,
                    usedUrls: [],
                  })}
                  kingdomId={kingdom.id}
                  task={task}
                  showPath={showPath}
                  onViewed={(resourceId, viewed) => game.patchResource(kingdom.id, task.id, resourceId, { viewed })}
                />
              )}
            </>
          )}
        </div>
      )}
      {pop && (
        <span className="xp-float pointer-events-none absolute -top-1 right-16 font-display text-sm text-burgundy">+{task.xp} XP</span>
      )}
    </li>
  )
}
