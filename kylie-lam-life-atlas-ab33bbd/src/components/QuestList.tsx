import { useState } from 'react'
import { useGame } from '../game/context.ts'
import { kingdomYield, sortTasks, taskStats } from '../game/logic.ts'
import { TaskRow } from './TaskRow.tsx'

/** Every land, and the quests the player has accepted. You can finish tasks here too. */
export function QuestList() {
  const game = useGame()
  const [draft, setDraft] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const stats = taskStats(game.state.kingdoms)

  return (
    <div className="h-full overflow-auto px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <p className="font-display text-xs tracking-[0.2em] text-burgundy">THE QUEST ROLL</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Lands you have discovered</h1>
        <p className="mt-1 font-manuscript text-xl italic text-ink-soft">
          {game.state.kingdoms.length === 0
            ? 'The map is only Homebase until you chart an idea.'
            : `${stats.done} of ${stats.total} quests kept.`}
        </p>

        <div className="mt-5 space-y-4">
          {game.state.kingdoms.map((kingdom) => {
            const progress = kingdomYield(kingdom)
            const tasks = sortTasks(kingdom.tasks, 'priority')
            return (
              <section key={kingdom.id} className="panel p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-xl tracking-wide">{kingdom.generatedName}</h2>
                  <button type="button" className="ink-button" onClick={() => game.travelTo(kingdom.id)}>
                    Walk there
                  </button>
                </div>
                <p className="font-manuscript text-lg italic text-ink-soft">{kingdom.description}</p>
                <p className="text-sm text-ink-soft">Your idea: “{kingdom.originalIdea}”</p>
                {tasks.length === 0 ? (
                  <p className="mt-2 text-sm">No quests written yet. Walk there to add your own, or ask for suggestions.</p>
                ) : (
                  <ul className="quest-chain mt-2">
                    {tasks.map((task, index) => (
                      <TaskRow
                        key={task.id}
                        kingdomId={kingdom.id}
                        task={task}
                        index={index}
                        onComplete={(origin) => game.completeTask(kingdom.id, task.id, origin)}
                      />
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-ink-soft">
                  {progress.done} of {progress.total} · {progress.coins} coins earned here
                </p>
              </section>
            )
          })}
        </div>

        <form
          className="panel mt-5 p-4"
          onSubmit={(event) => {
            event.preventDefault()
            const result = game.addIdea(draft)
            if (!result.ok) {
              setNote(result.reason)
              return
            }
            setDraft('')
            setNote(result.trimmed ? 'The first lines became lands. The map has no room for the rest.' : 'A new path has appeared.')
          }}
        >
          <label htmlFor="another-idea" className="font-display text-lg">
            Chart another idea
          </label>
          <p className="mt-1 text-sm text-ink-soft">One idea per line. Each line becomes its own land. Quests stay blank until you write them.</p>
          <textarea
            id="another-idea"
            className="ink-area mt-2 min-h-24"
            value={draft}
            placeholder="learn how to bake bread"
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className="ink-button mt-3">
            Add to the map
          </button>
          {note && <p className="mt-2 font-manuscript text-lg italic">{note}</p>}
        </form>
      </div>
    </div>
  )
}
