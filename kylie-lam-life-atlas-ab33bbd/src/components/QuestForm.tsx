import { useState } from 'react'
import { rewardFor } from '../game/rewards.ts'
import type { Priority, Task, TaskDraft } from '../game/types.ts'

const CHOICES: Priority[] = ['high', 'medium', 'low']

const COPY: Record<Priority, { marks: string; label: string }> = {
  high: { marks: '★★★', label: 'High' },
  medium: { marks: '★★', label: 'Medium' },
  low: { marks: '★', label: 'Low' },
}

export function QuestForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Task
  submitLabel: string
  onSubmit: (draft: TaskDraft) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [coins, setCoins] = useState(initial?.coins ?? rewardFor('medium').coins)
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [minutes, setMinutes] = useState(initial?.minutes ? String(initial.minutes) : '')
  const [touched, setTouched] = useState(Boolean(initial))
  const [error, setError] = useState<string | null>(null)

  function choose(next: Priority) {
    setPriority(next)
    if (!touched) setCoins(rewardFor(next).coins)
  }

  return (
    <form
      className="mt-3 border border-ink/20 bg-[#f8f1de] p-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!label.trim()) {
          setError('A quest needs a name.')
          return
        }
        onSubmit({
          label: label.trim(),
          description: description.trim(),
          priority,
          coins: Number(coins),
          deadline: deadline || null,
          minutes: minutes ? Number(minutes) : null,
        })
      }}
    >
      <label className="block text-sm" htmlFor="quest-name">
        Quest name
      </label>
      <input id="quest-name" className="ink-line mt-1" value={label} onChange={(event) => setLabel(event.target.value)} />

      <label className="mt-3 block text-sm" htmlFor="quest-notes">
        Description
      </label>
      <textarea
        id="quest-notes"
        className="ink-area mt-1 min-h-16 text-base"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <p className="mt-3 text-sm">Priority</p>
      <div className="mt-1 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Priority">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            role="radio"
            aria-checked={priority === choice}
            className={`priority-seal ${choice} ${priority === choice ? 'is-on' : ''}`}
            onClick={() => choose(choice)}
          >
            <span aria-hidden="true">{COPY[choice].marks}</span> {COPY[choice].label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-sm" htmlFor="quest-coins">
          Reward
          <input
            id="quest-coins"
            className="ink-line mt-1"
            type="number"
            min={10}
            max={100}
            value={coins}
            onChange={(event) => {
              setTouched(true)
              setCoins(Number(event.target.value))
            }}
          />
        </label>
        <label className="text-sm" htmlFor="quest-date">
          Deadline
          <input id="quest-date" className="ink-line mt-1" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </label>
        <label className="text-sm" htmlFor="quest-minutes">
          Estimated time (minutes)
          <input
            id="quest-minutes"
            className="ink-line mt-1"
            type="number"
            min={5}
            max={240}
            value={minutes}
            placeholder="Optional"
            onChange={(event) => setMinutes(event.target.value)}
          />
        </label>
      </div>
      <p className="mt-1 text-xs text-ink-soft">A heavier quest can pay more. You can change the coins.</p>
      {error && <p className="mt-2 font-manuscript text-lg text-burgundy">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" className="ink-button solid">
          {submitLabel}
        </button>
        <button type="button" className="ink-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
