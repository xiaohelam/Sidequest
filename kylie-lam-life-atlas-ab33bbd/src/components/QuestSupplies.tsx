import { useState } from 'react'
import { useGame } from '../game/context.ts'
import { KIND_META } from '../game/resources.ts'
import type { QuestResource, Task } from '../game/types.ts'
import { ResourceGlyph } from './ResourceGlyph.tsx'

/**
 * Aids for one quest, discovered by Help me start.
 * Bookmarking adds a copy to the Toolkit. It does not finish the quest.
 */
export function QuestSupplies({
  kit,
  kingdomId,
  task,
  showPath,
  onViewed,
}: {
  kit: string
  kingdomId: string
  task: Task
  showPath: boolean
  onViewed: (resourceId: string, viewed: boolean) => void
}) {
  const game = useGame()
  const kept = new Set(game.state.toolkit.filter((item) => item.questId === task.id).map((item) => item.id))
  const drafted = task.supplyKey.startsWith('ai\n')

  return (
    <div className="supply-sheet mt-2">
      <p className="font-display text-[10px] tracking-[0.16em] text-burgundy">
        {drafted ? 'Drafted for this quest' : 'Curated for this quest'}
      </p>
      <p className="mt-1 font-display text-sm leading-snug text-ink">Tools for: {task.label}</p>
      <p className="mt-1 font-display text-[10px] tracking-[0.16em] text-ink-soft">{kit}</p>
      <p className="mt-1 text-sm leading-snug text-ink-soft">
        {drafted
          ? 'Drafted for this quest. A link is shown only after this app checked the page. Bookmark what you want to keep. Opening a guide does not complete the quest.'
          : 'Chosen for this quest, not the whole kingdom. Bookmark what you want to keep. Opening a guide does not complete the quest.'}
      </p>

      {showPath && task.startPath.length > 0 && (
        <ol className="mt-3 space-y-2">
          {task.startPath.map((item, index) => (
            <li key={`${item.title}-${index}`} className="flex gap-2">
              <span className="font-display text-xs text-burgundy">{index + 1}</span>
              <span>
                <span className="text-sm leading-snug text-ink">{item.title}</span>
                {item.detail && <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{item.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}

      <ul className="mt-3 space-y-2">
        {task.resources.map((resource) => (
          <SupplyCard
            key={resource.id}
            resource={resource}
            bookmarked={kept.has(resource.id)}
            onOpen={() => {
              if (resource.url) window.open(resource.url, '_blank', 'noopener,noreferrer')
              if (!resource.viewed) onViewed(resource.id, true)
            }}
            onViewed={() => onViewed(resource.id, !resource.viewed)}
            onBookmark={() => {
              if (kept.has(resource.id)) game.forgetBookmark(resource.id)
              else game.bookmarkResource(kingdomId, task.id, resource.id)
            }}
            onToolkit={() => game.openToolkit(kingdomId)}
          />
        ))}
      </ul>
    </div>
  )
}

function SupplyCard({
  resource,
  bookmarked,
  onOpen,
  onViewed,
  onBookmark,
  onToolkit,
}: {
  resource: QuestResource
  bookmarked: boolean
  onOpen: () => void
  onViewed: () => void
  onBookmark: () => void
  onToolkit: () => void
}) {
  const meta = KIND_META[resource.kind]
  const [notice, setNotice] = useState(false)

  function keep() {
    const was = bookmarked
    onBookmark()
    if (!was) {
      setNotice(true)
      window.setTimeout(() => setNotice(false), 1600)
    }
  }

  return (
    <li className={`supply-card ${resource.viewed ? 'is-viewed' : ''} ${notice ? 'bookmark-glow' : ''}`}>
      <div className="flex items-start gap-2">
        <ResourceGlyph title={resource.title} kind={resource.kind} />
        <div className="min-w-0">
          <p className="font-display text-[10px] tracking-[0.14em] text-burgundy">{meta.name}</p>
          <p className="font-display text-sm leading-snug text-ink">{resource.title}</p>
          <p className="text-xs text-ink-soft">
            {resource.source}
            {resource.minutes ? ` · about ${resource.minutes} min` : ''}
          </p>
        </div>
      </div>
      <p className="mt-1 text-sm leading-snug text-ink">{resource.why}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {resource.url ? (
          <button type="button" className="ink-button solid" onClick={onOpen}>
            Open resource
          </button>
        ) : (
          <button type="button" className="ink-button" onClick={onViewed}>
            {resource.viewed ? 'Viewed' : 'Mark viewed'}
          </button>
        )}
        <button type="button" className={`ink-button ${bookmarked ? 'solid' : ''}`} aria-pressed={bookmarked} onClick={keep}>
          {bookmarked ? 'Bookmarked' : 'Save to Toolkit'}
        </button>
        {resource.url && (
          <button type="button" className="ink-button" aria-pressed={resource.viewed} onClick={onViewed}>
            {resource.viewed ? 'Viewed' : 'Mark viewed'}
          </button>
        )}
      </div>
      {notice && <p className="added-note">Added to Toolkit</p>}
      {bookmarked && (
        <button type="button" className="link-ink mt-1 text-sm" onClick={onToolkit}>
          View in Toolkit
        </button>
      )}
    </li>
  )
}
