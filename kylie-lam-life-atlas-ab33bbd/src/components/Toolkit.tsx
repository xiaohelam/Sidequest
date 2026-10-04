import { useMemo, useState } from 'react'
import { useGame } from '../game/context.ts'
import { KIND_META } from '../game/resources.ts'
import type { Kingdom, ResourceKind, ToolkitItem } from '../game/types.ts'
import { KingdomSeal, ResourceGlyph } from './ResourceGlyph.tsx'

const FILTERS: { id: 'all' | ResourceKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'watch', label: 'Watch' },
  { id: 'read', label: 'Read' },
  { id: 'explore', label: 'Explore' },
  { id: 'tool', label: 'Tool' },
  { id: 'get', label: 'Get' },
  { id: 'go', label: 'Go' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'inspire', label: 'Inspire' },
]

/** The satchel: bookmarks gathered from Help me start, sorted by kingdom. */
export function Toolkit() {
  const game = useGame()
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<'all' | ResourceKind>('all')
  const [leaving, setLeaving] = useState<string | null>(null)
  const items = game.state.toolkit
  const focus = game.toolkitFocus && game.state.kingdoms.some((kingdom) => kingdom.id === game.toolkitFocus) ? game.toolkitFocus : null

  const named = useMemo(() => items.map((item) => withLiveKingdom(item, game.state.kingdoms)), [items, game.state.kingdoms])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of named) map.set(item.kingdomId, (map.get(item.kingdomId) ?? 0) + 1)
    return map
  }, [named])

  const inKingdom = focus ? named.filter((item) => item.kingdomId === focus) : named
  const needle = query.trim().toLowerCase()
  const visible = inKingdom.filter((item) => {
    if (kind !== 'all' && item.kind !== kind) return false
    if (!needle) return true
    return `${item.title} ${item.source} ${item.questTitle} ${item.kingdomName} ${item.kind} ${item.why}`.toLowerCase().includes(needle)
  })
  const recent = [...inKingdom].sort((a, b) => b.savedAt - a.savedAt).slice(0, 4)
  const selected = focus ? game.state.kingdoms.find((kingdom) => kingdom.id === focus) : null
  const kingdomCount = new Set(named.map((item) => item.kingdomId)).size

  function remove(id: string) {
    setLeaving(id)
    window.setTimeout(() => {
      game.forgetBookmark(id)
      setLeaving((current) => (current === id ? null : current))
    }, 220)
  }

  return (
    <div className="satchel h-full overflow-auto px-4 py-5">
      <div className="mx-auto max-w-5xl">
        <p className="font-display text-xs tracking-[0.22em] text-burgundy">THE ADVENTURER'S TOOLKIT</p>
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">A collection of knowledge gathered along your journey.</h1>
        <p className="mt-2 max-w-2xl font-manuscript text-xl italic text-ink-soft">Your collected tools, guides, maps, and knowledge.</p>

        {items.length === 0 ? (
          <EmptySatchel onReturn={() => game.setView('map')} />
        ) : (
          <>
            <label className="mt-4 block max-w-md text-sm" htmlFor="toolkit-search">
              Search your collected resources
              <input
                id="toolkit-search"
                className="ink-line mt-1"
                value={query}
                placeholder="A kingdom, a quest, a guide…"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            {recent.length > 0 && !needle && (
              <section className="mt-5">
                <h2 className="font-display text-xs tracking-[0.16em]">Recently gathered</h2>
                <ul className="mt-2 flex gap-2 overflow-auto pb-1">
                  {recent.map((item) => (
                    <li key={item.id}>
                      <button type="button" className="recent-slip" onClick={() => game.openToolkit(item.kingdomId)}>
                        <ResourceGlyph title={item.title} kind={item.kind} motif={item.motif} />
                        <span className="min-w-0 text-left">
                          <span className="block font-display text-[10px] tracking-wide text-burgundy">{KIND_META[item.kind].name}</span>
                          <span className="block text-sm leading-snug">{item.title}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-5 flex flex-col gap-4 md:flex-row">
              <aside className="md:w-56 md:shrink-0">
                <p className="font-display text-[10px] tracking-[0.16em] text-ink-soft">Your kingdoms</p>
                <div className="mt-2 flex gap-2 overflow-auto md:flex-col">
                  <button type="button" className={`kingdom-tab ${focus === null ? 'is-on' : ''}`} onClick={() => game.openToolkit(null)}>
                    <span>All resources</span>
                    <span className="text-xs text-ink-soft">{items.length}</span>
                  </button>
                  {game.state.kingdoms.map((kingdom) => (
                    <button
                      key={kingdom.id}
                      type="button"
                      className={`kingdom-tab ${focus === kingdom.id ? 'is-on' : ''}`}
                      onClick={() => game.openToolkit(kingdom.id)}
                    >
                      <KingdomSeal motif={kingdom.motif} />
                      <span className="min-w-0 text-left">
                        <span className="block font-display text-xs leading-tight">{kingdom.generatedName}</span>
                        <span className="text-xs text-ink-soft">{counts.get(kingdom.id) ?? 0} gathered</span>
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-soft">
                  {kingdomCount} {kingdomCount === 1 ? 'kingdom' : 'kingdoms'} · {items.length} {items.length === 1 ? 'tool' : 'tools'}
                </p>
              </aside>

              <section className="min-w-0 flex-1">
                <header className="flex items-start gap-3">
                  {selected && <KingdomSeal motif={selected.motif} />}
                  <div>
                    <h2 className="font-display text-2xl">{selected ? selected.generatedName : 'Every land'}</h2>
                    <p className="font-manuscript text-lg italic text-ink-soft">
                      {selected
                        ? `Gathered from your journey to ${selected.generatedName}. “${selected.originalIdea}”`
                        : 'Everything you chose to keep, from every kingdom.'}
                    </p>
                  </div>
                </header>

                <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Resource type">
                  {FILTERS.filter((option) => option.id === 'all' || inKingdom.some((item) => item.kind === option.id)).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={kind === option.id}
                      className={`ink-button ${kind === option.id ? 'solid' : ''}`}
                      onClick={() => setKind(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {visible.length === 0 ? (
                  <p className="mt-4 font-manuscript text-xl italic">Nothing in the satchel matches that.</p>
                ) : (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {visible.map((item) => (
                      <li key={item.id} className={leaving === item.id ? 'satchel-leave' : ''}>
                        <ToolkitCard item={item} onRemove={() => remove(item.id)} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function withLiveKingdom(item: ToolkitItem, kingdoms: Kingdom[]): ToolkitItem {
  const kingdom = kingdoms.find((land) => land.id === item.kingdomId)
  if (!kingdom) return item
  return { ...item, kingdomName: kingdom.generatedName, motif: kingdom.motif }
}

function ToolkitCard({ item, onRemove }: { item: ToolkitItem; onRemove: () => void }) {
  const meta = KIND_META[item.kind]
  return (
    <article className="satchel-card h-full">
      <div className="flex items-start gap-3">
        <ResourceGlyph title={item.title} kind={item.kind} motif={item.motif} />
        <div className="min-w-0">
          <p className="font-display text-[10px] tracking-[0.14em] text-burgundy">{meta.name}</p>
          <h3 className="font-display text-base leading-snug">{item.title}</h3>
          <p className="text-xs text-ink-soft">
            {item.source}
            {item.minutes ? ` · about ${item.minutes} min` : ''}
          </p>
        </div>
      </div>
      <p className="mt-2 font-manuscript text-lg italic leading-snug">“{item.why}”</p>
      <p className="mt-2 text-sm">
        Quest: {item.questTitle}
        <span className="text-ink-soft"> · {item.kingdomName}</span>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {item.url ? (
          <a className="ink-button solid" href={item.url} target="_blank" rel="noreferrer">
            Open
          </a>
        ) : (
          <span className="text-xs text-ink-soft">Kept as a note. It has no outside page.</span>
        )}
        <button type="button" className="link-ink text-sm" onClick={onRemove}>
          Remove from Toolkit
        </button>
      </div>
    </article>
  )
}

function EmptySatchel({ onReturn }: { onReturn: () => void }) {
  return (
    <div className="satchel-card mx-auto mt-8 max-w-xl text-center">
      <KingdomSeal motif="road" />
      <h2 className="mt-3 font-display text-2xl">Your toolkit is empty</h2>
      <p className="mt-2 font-manuscript text-xl italic">Every journey begins with an empty satchel.</p>
      <p className="mt-2 text-sm leading-snug">
        Visit a kingdom and choose Help me start to discover useful tools, guides, maps, and knowledge.
      </p>
      <button type="button" className="ink-button solid mt-4" onClick={onReturn}>
        Return to the map
      </button>
    </div>
  )
}
