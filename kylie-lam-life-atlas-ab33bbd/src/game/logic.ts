/**
 * Kingdom and quest rules.
 * This file is pure: no localStorage and no React.
 */

import { LEVEL_TITLES, MAX_IDEAS, XP_PER_LEVEL } from '../config/app.ts'
import { shopItemById } from '../config/shop.ts'
import { nextSite, tintFrom } from './layout.ts'
import { chartIdea } from './naming.ts'
import { rewardFor, xpForCoins } from './rewards.ts'
import type { GameState, Kingdom, Task, TaskDraft, TaskSort } from './types.ts'

export function newId(): string {
  return crypto.randomUUID()
}

/** A new land, with no quests yet. The player writes those, or accepts suggestions. */
export function createKingdom(idea: string, taken: { x: number; y: number }[], salt: number): Kingdom {
  const charted = chartIdea(idea)
  const id = newId()
  return {
    id,
    originalIdea: idea.trim(),
    generatedName: charted.generatedName,
    description: charted.description,
    category: charted.category,
    motif: charted.motif,
    tint: tintFrom(id),
    ...nextSite(taken, salt),
    tasks: [],
    createdAt: Date.now() + salt,
    seen: false,
  }
}

export function createKingdomsFromText(
  raw: string,
  taken: { x: number; y: number }[] = [],
): { kingdoms: Kingdom[]; trimmed: boolean; full: boolean } {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (taken.length >= MAX_IDEAS) return { kingdoms: [], trimmed: lines.length > 0, full: true }
  const room = MAX_IDEAS - taken.length
  const chosen = lines.slice(0, room)
  const kingdoms: Kingdom[] = []
  chosen.forEach((line, index) => {
    kingdoms.push(createKingdom(line, [...taken, ...kingdoms], taken.length + index))
  })
  return { kingdoms, trimmed: lines.length > chosen.length, full: false }
}

export function taskFromDraft(draft: TaskDraft): Task {
  const coins = clampCoins(draft.coins)
  const expected = rewardFor(draft.priority).coins
  return {
    id: newId(),
    label: draft.label.trim(),
    description: draft.description.trim(),
    priority: draft.priority,
    coins,
    xp: coins === expected ? rewardFor(draft.priority).xp : xpForCoins(coins),
    done: false,
    createdAt: Date.now(),
    deadline: draft.deadline,
    minutes: draft.minutes && draft.minutes > 0 ? Math.min(240, Math.round(draft.minutes)) : null,
    resources: [],
    startPath: [],
    supplyKey: '',
  }
}

/** A level change caused by earning XP. Spending or resetting does not qualify. */
export function levelCrossing(beforeXp: number, afterXp: number): { from: number; to: number } | null {
  if (afterXp <= beforeXp) return null
  const from = levelProgress(beforeXp).level
  const to = levelProgress(afterXp).level
  if (to <= from) return null
  return { from, to }
}

export function clampCoins(coins: number): number {
  if (!Number.isFinite(coins)) return rewardFor('medium').coins
  return Math.min(100, Math.max(10, Math.round(coins)))
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const

export function sortTasks(tasks: Task[], mode: TaskSort): Task[] {
  const copy = [...tasks]
  if (mode === 'order') return copy
  if (mode === 'recent') return copy.sort((a, b) => b.createdAt - a.createdAt)
  if (mode === 'completion') return copy.sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt - b.createdAt)
  return copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.createdAt - b.createdAt)
}

/** Drop `fromId` onto `toId` inside the currently visible list, then keep that as the chain. */
export function reorderVisible(tasks: Task[], visibleIds: string[], fromId: string, toId: string): Task[] {
  const ids = [...visibleIds]
  const from = ids.indexOf(fromId)
  const to = ids.indexOf(toId)
  if (from < 0 || to < 0 || from === to) return tasks
  ids.splice(to, 0, ids.splice(from, 1)[0])
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const ordered = ids.map((id) => byId.get(id)).filter((task): task is Task => Boolean(task))
  const rest = tasks.filter((task) => !ids.includes(task.id))
  return [...ordered, ...rest]
}

export function todayISO(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Streak only counts if the player was active today or yesterday. */
export function visibleStreak(state: GameState, now = new Date()): number {
  if (!state.lastActiveDate || state.streak <= 0) return 0
  const today = todayISO(now)
  const yesterday = todayISO(addDays(now, -1))
  if (state.lastActiveDate === today || state.lastActiveDate === yesterday) return state.streak
  return 0
}

export function levelProgress(xp: number): { level: number; into: number; need: number; title: string } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const into = xp % XP_PER_LEVEL
  const title = LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1] ?? 'Legend of the Map'
  return { level, into, need: XP_PER_LEVEL, title }
}

export function applyCompletion(state: GameState, kingdomId: string, taskId: string, now = new Date()): GameState | null {
  const kingdom = state.kingdoms.find((item) => item.id === kingdomId)
  const task = kingdom?.tasks.find((item) => item.id === taskId)
  if (!kingdom || !task || task.done) return null

  const today = todayISO(now)
  const yesterday = todayISO(addDays(now, -1))
  let streak = 1
  if (state.lastActiveDate === today) streak = Math.max(1, state.streak)
  else if (state.lastActiveDate === yesterday) streak = state.streak + 1

  return {
    ...state,
    coins: state.coins + task.coins,
    lifetimeCoins: state.lifetimeCoins + task.coins,
    xp: state.xp + task.xp,
    streak,
    lastActiveDate: today,
    completions: [...state.completions, { taskId, date: today }],
    kingdoms: state.kingdoms.map((item) =>
      item.id !== kingdomId
        ? item
        : { ...item, tasks: item.tasks.map((entry) => (entry.id === taskId ? { ...entry, done: true } : entry)) },
    ),
  }
}

export function applyPurchase(state: GameState, itemId: string): GameState | null {
  const item = shopItemById(itemId)
  if (!item) return null
  if (state.ownedItemIds.includes(itemId)) return null
  if (state.coins < item.price) return null
  return {
    ...state,
    coins: state.coins - item.price,
    ownedItemIds: [...state.ownedItemIds, itemId],
  }
}

export function kingdomStatus(kingdom: Kingdom): 'empty' | 'open' | 'done' {
  if (kingdom.tasks.length === 0) return 'empty'
  return kingdom.tasks.every((task) => task.done) ? 'done' : 'open'
}

export function taskStats(kingdoms: Kingdom[]): { total: number; done: number } {
  let total = 0
  let done = 0
  for (const kingdom of kingdoms) {
    for (const task of kingdom.tasks) {
      total += 1
      if (task.done) done += 1
    }
  }
  return { total, done }
}

export function kingdomYield(kingdom: Kingdom): { coins: number; xp: number; done: number; total: number } {
  let coins = 0
  let xp = 0
  let done = 0
  for (const task of kingdom.tasks) {
    if (!task.done) continue
    coins += task.coins
    xp += task.xp
    done += 1
  }
  return { coins, xp, done, total: kingdom.tasks.length }
}

export function completionsThisMonth(state: GameState, now = new Date()): number {
  const prefix = todayISO(now).slice(0, 7)
  return state.completions.filter((entry) => entry.date.startsWith(prefix)).length
}

export function findTask(state: GameState, taskId: string): { kingdom: Kingdom; task: Task } | null {
  for (const kingdom of state.kingdoms) {
    const task = kingdom.tasks.find((item) => item.id === taskId)
    if (task) return { kingdom, task }
  }
  return null
}

export function mapFull(state: GameState): boolean {
  return state.kingdoms.length >= MAX_IDEAS
}
