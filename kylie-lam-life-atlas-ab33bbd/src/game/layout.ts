/**
 * Place a new kingdom on the map without covering Homebase or another land.
 * Positions are saved on the kingdom, so a refresh does not shuffle the world.
 */

import { HOME, MAP } from '../config/world.ts'
import type { Kingdom } from './types.ts'

const MIN_GAP = 158

export function tintFrom(id: string): number {
  let sum = 0
  for (const char of id) sum += char.charCodeAt(0)
  return sum % 5
}

export function nextSite(taken: { x: number; y: number }[], salt: number): Pick<Kingdom, 'x' | 'y' | 'bend' | 'heroDx' | 'heroDy' | 'label'> {
  for (let attempt = 0; attempt < 48; attempt++) {
    const n = salt + attempt
    const ring = Math.floor(n / 6)
    const angle = n * 2.399963 + ring * 0.35
    const radius = 200 + ring * 125
    const x = clamp(HOME.x + Math.cos(angle) * radius, 190, MAP.width - 190)
    const y = clamp(HOME.y + Math.sin(angle) * radius * 0.78, 150, MAP.height - 150)
    const clear = taken.every((point) => Math.hypot(point.x - x, point.y - y) >= MIN_GAP)
    const clearOfHome = Math.hypot(HOME.x - x, HOME.y - y) >= 150
    if (clear && clearOfHome) {
      return {
        x: Math.round(x),
        y: Math.round(y),
        bend: (n % 2 === 0 ? 1 : -1) * (34 + (n % 4) * 10),
        heroDx: 16,
        heroDy: 56,
        label: y < 210 ? 'below' : 'above',
      }
    }
  }
  const fallback = salt % 8
  return {
    x: 240 + (fallback % 4) * 280,
    y: 200 + Math.floor(fallback / 4) * 260,
    bend: 40,
    heroDx: 16,
    heroDy: 56,
    label: 'above',
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
