/**
 * App-wide settings.
 * To rename the product, change APP_NAME. The tab title, map cartouche,
 * and onboarding screen all read this constant.
 */

export const APP_NAME = 'Sidequest'

export const TAGLINE =
  "Don't turn your life into a to-do list. Turn it into a world you can explore."

/** localStorage key. Change this if you want a clean save slot. */
export const STORAGE_KEY = 'sidequest-save-v1'

/** Experience points required to gain one level. */
export const XP_PER_LEVEL = 100

/** How many tasks the journey screen asks for in the current month. */
export const MONTHLY_GOAL = 8

/** Safety cap so a huge paste cannot flood the map. */
export const MAX_IDEAS = 12

export const LEVEL_TITLES = [
  'Apprentice Wanderer',
  'Pathfinder',
  'Scout of the Realm',
  'Adventurer',
  'Cartographer',
  'Knight-Errant',
  'Lorekeeper',
  'Warden',
  'Legend of the Map',
] as const

/**
 * One idea per line. The "Use the sample list" button on the
 * onboarding screen fills the box with this text.
 */
export const SAMPLE_IDEAS = `learn Python
run a 5K
learn guitar
read more philosophy
make a short film
learn Japanese`
