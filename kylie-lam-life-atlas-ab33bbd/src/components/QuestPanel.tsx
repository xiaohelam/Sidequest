import { useEffect, useMemo, useState } from 'react'
import { aiUnconfigured, aiWillAnswer, draftQuests, getAiKey } from '../game/ai.ts'
import { useGame } from '../game/context.ts'
import { kingdomYield, sortTasks } from '../game/logic.ts'
import { goalKindLabel, suggestQuests, type ScribeBrief, type ScribeMode, type Suggestion } from '../game/scribe.ts'
import type { Kingdom, Task, TaskDraft, TaskSort } from '../game/types.ts'
import { ConfirmDialog } from './ConfirmDialog.tsx'
import { QuestForm } from './QuestForm.tsx'
import { ScrollFrame } from './ScrollFrame.tsx'
import { TaskRow } from './TaskRow.tsx'

const MODES: { id: ScribeMode; label: string }[] = [
  { id: 'foundation', label: 'Build a foundation' },
  { id: 'challenge', label: 'Give me a challenge' },
  { id: 'quick', label: 'Quick wins' },
  { id: 'long', label: 'Long-term quest' },
  { id: 'surprise', label: 'Surprise me' },
]

const EMPTY_BRIEF: ScribeBrief = { level: '', focus: '', time: '', note: '' }

const SORTS: { id: TaskSort; label: string }[] = [
  { id: 'priority', label: 'Priority' },
  { id: 'order', label: 'Quest chain' },
  { id: 'completion', label: 'Completion' },
  { id: 'recent', label: 'Recently added' },
]

export function QuestPanel({ placeId }: { placeId: string }) {
  const game = useGame()
  const kingdom = game.state.kingdoms.find((item) => item.id === placeId)
  const onClose = game.setOpenPlaceId

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('[data-level-up]')) onClose(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!kingdom) {
    return (
      <ScrollFrame label="Missing land" onClose={() => onClose(null)}>
        <p className="font-manuscript text-xl italic">That land is no longer on the map.</p>
      </ScrollFrame>
    )
  }

  return <KingdomScroll kingdom={kingdom} onClose={() => onClose(null)} />
}

function KingdomScroll({ kingdom, onClose }: { kingdom: Kingdom; onClose: () => void }) {
  const game = useGame()
  const [sort, setSort] = useState<TaskSort>('priority')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null)
  const [scribeSource, setScribeSource] = useState<'ai' | 'shelf'>('shelf')
  const [scribing, setScribing] = useState(false)
  const [scribeNote, setScribeNote] = useState('')
  const [asking, setAsking] = useState(false)
  const [brief, setBrief] = useState<ScribeBrief>(EMPTY_BRIEF)
  const [draftSuggestion, setDraftSuggestion] = useState<Suggestion | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [abandoning, setAbandoning] = useState(false)
  const [editingLand, setEditingLand] = useState(false)
  const [landName, setLandName] = useState(kingdom.generatedName)
  const [landBlurb, setLandBlurb] = useState(kingdom.description)
  const [freshId, setFreshId] = useState<string | null>(null)
  const progress = kingdomYield(kingdom)
  const visible = useMemo(() => sortTasks(kingdom.tasks, sort), [kingdom.tasks, sort])
  const visibleIds = visible.map((task) => task.id)

  function accept(suggestion: Suggestion, draft?: TaskDraft) {
    const id = game.addTask(kingdom.id, {
      label: draft?.label ?? suggestion.label,
      description: draft?.description ?? suggestion.description,
      priority: draft?.priority ?? suggestion.priority,
      coins: draft?.coins ?? suggestion.coins,
      deadline: draft?.deadline ?? null,
      minutes: draft?.minutes ?? suggestion.minutes,
    })
    setFreshId(id)
    setSuggestions((current) => current?.filter((item) => item.id !== suggestion.id) ?? null)
    setDraftSuggestion(null)
  }

  async function askScribe(mode: ScribeMode) {
    if (scribing) return
    const labels = kingdom.tasks.map((task) => task.label)
    const local = suggestQuests(kingdom.originalIdea, labels, brief, mode)
    setDraftSuggestion(null)
    setScribeNote('')
    const key = getAiKey()
    const useModel = await aiWillAnswer(key)
    if (!useModel) {
      setScribeSource('shelf')
      setSuggestions(local)
      return
    }
    setScribing(true)
    setSuggestions(null)
    try {
      const drafted = await draftQuests(
        {
          idea: kingdom.originalIdea,
          kingdomName: kingdom.generatedName,
          kingdomDescription: kingdom.description,
          category: kingdom.category,
          existingLabels: labels,
          brief,
          mode,
        },
        key,
      )
      setScribeSource('ai')
      setSuggestions(drafted)
    } catch (error) {
      setScribeSource('shelf')
      setSuggestions(local)
      if (!aiUnconfigured(error)) {
        const message = error instanceof Error && error.message ? error.message : 'The AI guide could not answer.'
        setScribeNote(`${message} The local scribe answered instead.`)
      }
    } finally {
      setScribing(false)
    }
  }

  return (
    <ScrollFrame label={kingdom.generatedName} onClose={onClose}>
      <p className="font-display text-xs tracking-[0.18em] text-burgundy">NEW LAND</p>
      <h2 className="mt-1 pr-16 font-display text-2xl leading-tight tracking-wide text-ink">{kingdom.generatedName}</h2>
      <p className="mt-1 font-manuscript text-lg italic leading-snug text-ink-soft">{kingdom.description}</p>
      <p className="mt-2 text-sm leading-snug text-ink">
        Your idea: “{kingdom.originalIdea}”
      </p>
      <p className="mt-1 text-xs text-ink-soft">
        {progress.total === 0
          ? 'No quests yet. This land is waiting for what you actually want to do.'
          : `${progress.done} of ${progress.total} kept · ${progress.coins} coins and ${progress.xp} XP earned here`}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="ink-button" onClick={() => setEditingLand((open) => !open)}>
          Edit
        </button>
        <button type="button" className="ink-button" onClick={() => setAbandoning(true)}>
          Delete kingdom
        </button>
      </div>
      {editingLand && (
        <form
          className="mt-3 border border-ink/20 bg-[#f8f1de] p-3"
          onSubmit={(event) => {
            event.preventDefault()
            game.updateKingdom(kingdom.id, { generatedName: landName, description: landBlurb })
            setEditingLand(false)
          }}
        >
          <label className="block text-sm" htmlFor="land-name">
            Land name
            <input id="land-name" className="ink-line mt-1" value={landName} onChange={(event) => setLandName(event.target.value)} />
          </label>
          <label className="mt-2 block text-sm" htmlFor="land-blurb">
            Description
            <textarea id="land-blurb" className="ink-area mt-1 min-h-16 text-base" value={landBlurb} onChange={(event) => setLandBlurb(event.target.value)} />
          </label>
          <p className="mt-1 text-xs text-ink-soft">Your original idea stays on the scroll.</p>
          <button type="submit" className="ink-button mt-2">
            Save the land
          </button>
        </form>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="ink-button solid"
          onClick={() => {
            setAdding(true)
            setEditing(null)
          }}
        >
          + Add quest
        </button>
        <button
          type="button"
          className="ink-button"
          onClick={() => {
            setAsking((open) => !open)
            setDraftSuggestion(null)
          }}
        >
          Ask the Scribe
        </button>
      </div>

      {asking && (
        <div className="mt-3 border border-ink/20 p-3">
          <p className="font-display text-xs tracking-[0.16em]">TELL THE SCRIBE A LITTLE MORE</p>
          <p className="mt-1 text-sm text-ink-soft">
            Optional. The Scribe already reads this as {goalKindLabel(kingdom.originalIdea).toLowerCase()}. With a key saved on Journey, these buttons ask the guide. Otherwise the plans in this browser answer. Nothing is added until you accept it.
          </p>
          <p className="mt-3 text-sm">Current level</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={`ink-button ${brief.level === level ? 'solid' : ''}`}
                onClick={() => setBrief((current) => ({ ...current, level: current.level === level ? '' : level }))}
              >
                {level}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm" htmlFor="scribe-focus">
            What I want to improve
            <input
              id="scribe-focus"
              className="ink-line mt-1"
              placeholder="Technique, endurance, speed, confidence…"
              value={brief.focus}
              onChange={(event) => setBrief((current) => ({ ...current, focus: event.target.value }))}
            />
          </label>
          <p className="mt-3 text-sm">Time available</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {(
              [
                ['15', '15 min'],
                ['30', '30 min'],
                ['60', '1 hour'],
                ['', 'Flexible'],
              ] as const
            ).map(([time, label]) => (
              <button
                key={label}
                type="button"
                className={`ink-button ${brief.time === time ? 'solid' : ''}`}
                onClick={() => setBrief((current) => ({ ...current, time }))}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm" htmlFor="scribe-note">
            Anything else the Scribe should know?
            <textarea
              id="scribe-note"
              className="ink-area mt-1 min-h-16 text-base"
              value={brief.note}
              onChange={(event) => setBrief((current) => ({ ...current, note: event.target.value }))}
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className="ink-button"
                disabled={scribing}
                onClick={() => void askScribe(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          {scribing && <p className="mt-2 font-manuscript text-lg italic text-ink-soft">The Scribe is reading…</p>}
          {scribeNote && !scribing && <p className="mt-2 text-sm leading-snug text-burgundy">{scribeNote}</p>}
        </div>
      )}

      {adding && (
        <QuestForm
          submitLabel="Add to the chain"
          onCancel={() => setAdding(false)}
          onSubmit={(draft) => {
            setFreshId(game.addTask(kingdom.id, draft))
            setAdding(false)
          }}
        />
      )}

      {suggestions && (
        <div className="mt-4 border border-ink/20 p-3">
          <p className="font-display text-xs tracking-[0.16em]">THE SCRIBE SUGGESTS</p>
          <p className="mt-1 text-sm leading-snug text-ink-soft">
            {scribeSource === 'ai'
              ? 'Drafted for this kingdom. Nothing is added until you accept it. Edit any line first if it is not quite right.'
              : 'Read from your idea, in this browser. Nothing is added until you accept it. Edit any line first if it is not quite right.'}
          </p>
          {suggestions.length === 0 ? (
            <p className="mt-2 font-manuscript text-lg italic">Nothing new to suggest. The chain already holds these steps.</p>
          ) : (
            <ul className="mt-2 space-y-3">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id} className="border-t border-ink/15 pt-2">
                  {draftSuggestion?.id === suggestion.id ? (
                    <QuestForm
                      initial={{
                        id: suggestion.id,
                        label: suggestion.label,
                        description: suggestion.description,
                        priority: suggestion.priority,
                        coins: suggestion.coins,
                        xp: suggestion.xp,
                        done: false,
                        createdAt: 0,
                        deadline: null,
                        minutes: suggestion.minutes,
                        resources: [],
                        startPath: [],
                        supplyKey: '',
                      }}
                      submitLabel="Accept edited quest"
                      onCancel={() => setDraftSuggestion(null)}
                      onSubmit={(draft) => accept(suggestion, draft)}
                    />
                  ) : (
                    <>
                      <p className="font-display text-[10px] tracking-[0.14em] text-burgundy">Quest {index + 1}</p>
                      <p className="font-display text-base leading-snug">{suggestion.title}</p>
                      <p className="font-manuscript text-lg italic leading-snug text-ink">“{suggestion.action}”</p>
                      <p className="mt-1 text-sm leading-snug text-ink-soft">{suggestion.why}</p>
                      <p className="mt-1 font-display text-[10px] tracking-wide text-ink-soft">
                        {suggestion.stage} · {'★'.repeat(suggestion.difficulty)}
                        {'☆'.repeat(3 - suggestion.difficulty)} · {suggestion.coins} coins · {suggestion.minutes} min
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <button type="button" className="ink-button solid" onClick={() => accept(suggestion)}>
                          Accept
                        </button>
                        <button type="button" className="ink-button" onClick={() => setDraftSuggestion(suggestion)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ink-button"
                          onClick={() => setSuggestions((current) => current?.filter((item) => item.id !== suggestion.id) ?? null)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {kingdom.tasks.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Sort quests">
            {SORTS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={sort === option.id}
                className={`ink-button ${sort === option.id ? 'solid' : ''}`}
                onClick={() => setSort(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            {sort === 'order' ? 'Drag a quest to move it along the chain.' : 'Drag any quest to set a new chain order.'}
          </p>
          <ul className="quest-chain mt-1">
            {visible.map((task, index) => (
              <TaskRow
                key={task.id}
                kingdomId={kingdom.id}
                task={task}
                index={index}
                fresh={freshId === task.id}
                onComplete={(origin) => game.completeTask(kingdom.id, task.id, origin)}
                onEdit={() => {
                  setEditing(task)
                  setAdding(false)
                }}
                onRemove={() => game.removeTask(kingdom.id, task.id)}
                onDragStart={() => setDragId(task.id)}
                onDrop={() => {
                  if (!dragId || dragId === task.id) return
                  game.reorderTasks(kingdom.id, visibleIds, dragId, task.id)
                  setDragId(null)
                  setSort('order')
                }}
              />
            ))}
          </ul>
        </>
      )}

      {editing && (
        <QuestForm
          initial={editing}
          submitLabel="Save quest"
          onCancel={() => setEditing(null)}
          onSubmit={(draft) => {
            game.updateTask(kingdom.id, editing.id, draft)
            setEditing(null)
          }}
        />
      )}

      {progress.total > 0 && progress.done === progress.total && (
        <p className="mt-3 font-manuscript text-lg italic text-burgundy">This land is at peace.</p>
      )}
      {abandoning && (
        <ConfirmDialog
          title="Abandon this kingdom?"
          body="This will remove the kingdom and all of its quests from your map."
          confirmLabel="Abandon kingdom"
          cancelLabel="Cancel"
          onCancel={() => setAbandoning(false)}
          onConfirm={() => {
            setAbandoning(false)
            game.removeKingdom(kingdom.id)
          }}
        />
      )}
    </ScrollFrame>
  )
}
