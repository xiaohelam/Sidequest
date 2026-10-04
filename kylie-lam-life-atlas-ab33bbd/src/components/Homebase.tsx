import { useState } from 'react'
import { SHOP_ITEMS } from '../config/shop.ts'
import { useGame } from '../game/context.ts'
import { Room } from './home/Room.tsx'
import { ScrollFrame } from './ScrollFrame.tsx'

export function Homebase() {
  const game = useGame()
  const [note, setNote] = useState<string | null>(null)

  return (
    <div className="h-full overflow-auto px-4 py-3">
      <div className="mx-auto grid h-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.7fr)]">
        <section className="panel flex min-h-[420px] flex-col p-4">
          <p className="font-display text-xs tracking-[0.2em] text-burgundy">THE HALL</p>
          <h1 className="font-display text-3xl text-ink">Homebase</h1>
          <p className="font-manuscript text-xl italic text-ink-soft">
            {game.state.ownedItemIds.length === 0
              ? 'The hall is spare. Spend coins from the road to furnish it.'
              : 'What you bought is here, waiting for you to come back.'}
          </p>
          <div className="mt-2 min-h-0 flex-1">
            <Room owned={game.state.ownedItemIds} />
          </div>
        </section>

        <ScrollFrame label="Furnishing catalog">
          <p className="font-display text-xs tracking-[0.18em] text-burgundy">THE CATALOG</p>
          <h2 className="mt-1 font-display text-2xl">Spend your coins</h2>
          <p className="mt-1 font-manuscript text-lg italic">
            Purse · {game.state.coins} coin{game.state.coins === 1 ? '' : 's'}
          </p>
          <ul className="mt-3">
            {SHOP_ITEMS.map((item) => {
              const owned = game.state.ownedItemIds.includes(item.id)
              const afford = game.state.coins >= item.price
              return (
                <li key={item.id} className="border-b border-ink/15 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg">{item.name}</h3>
                    <span className="font-display text-sm">{item.price}</span>
                  </div>
                  <p className="font-manuscript text-lg italic leading-snug text-ink-soft">{item.blurb}</p>
                  {owned ? (
                    <p className="mt-1 text-sm text-burgundy">Placed in the hall</p>
                  ) : (
                    <button
                      type="button"
                      className="ink-button mt-2"
                      disabled={!afford}
                      onClick={() => {
                        const result = game.buyItem(item.id)
                        setNote(result.ok ? `The ${item.name.toLowerCase()} is in the hall.` : result.reason)
                      }}
                    >
                      {afford ? 'Place in the hall' : `Need ${item.price - game.state.coins} more`}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
          {note && (
            <p className="mt-3 font-manuscript text-lg italic" aria-live="polite">
              {note}
            </p>
          )}
        </ScrollFrame>
      </div>
    </div>
  )
}
