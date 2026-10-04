/**
 * The map's fixed geography.
 *
 * Homebase is the only place every realm starts with.
 * Every other land is created from an idea the player wrote.
 * See `src/game/naming.ts` for how a sentence becomes a kingdom.
 */

export const MAP = { width: 1400, height: 900 }

export const HOME = {
  id: 'home',
  name: 'Homebase',
  blurb: 'The hall at the center of the realm. Every new road leaves from here.',
  x: 700,
  y: 480,
  heroDx: 28,
  heroDy: 54,
  bend: 0,
} as const
