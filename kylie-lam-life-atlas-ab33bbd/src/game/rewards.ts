/** Coin and XP rewards, tied to how heavy a quest is. The player can still edit the coins. */

import type { Priority } from './types.ts'

export function rewardFor(priority: Priority): { coins: number; xp: number } {
  if (priority === 'high') return { coins: 75, xp: 55 }
  if (priority === 'medium') return { coins: 35, xp: 28 }
  return { coins: 15, xp: 12 }
}

export function xpForCoins(coins: number): number {
  return Math.max(8, Math.round(coins * 0.75))
}
