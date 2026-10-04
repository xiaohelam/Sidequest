import { useGame } from '../game/context.ts'
import type { ViewId } from '../game/types.ts'

const ITEMS: { id: ViewId; label: string }[] = [
  { id: 'map', label: 'Map' },
  { id: 'quests', label: 'Quests' },
  { id: 'toolkit', label: 'Toolkit' },
  { id: 'homebase', label: 'Homebase' },
  { id: 'journey', label: 'Journey' },
]

/** A wooden signpost — the realm's navigation, not a website navbar. */
export function NavHUD() {
  const game = useGame()

  return (
    <nav className="flex justify-center px-3 pb-3 pt-1" aria-label="Realm">
      <div className="signpost">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="plank"
            aria-current={game.view === item.id ? 'page' : undefined}
            onClick={() => {
              game.setOpenPlaceId(null)
              game.setView(item.id)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
