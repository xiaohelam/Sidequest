import { useGame } from '../game/context.ts'
import { CoinIcon } from './icons.tsx'

/** Coins that fly from a finished task toward the purse in the HUD. */
export function CoinFlight() {
  const { flights } = useGame()
  return (
    <div aria-hidden="true">
      {flights.map((flight) => (
        <span
          key={flight.id}
          className="coin-flight"
          style={{
            left: flight.x,
            top: flight.y,
            ['--dx' as string]: `${flight.dx}px`,
            ['--dy' as string]: `${flight.dy}px`,
            ['--delay' as string]: `${flight.delay}ms`,
          }}
        >
          <CoinIcon className="h-[22px] w-[22px]" />
        </span>
      ))}
    </div>
  )
}
