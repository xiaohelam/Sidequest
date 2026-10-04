/**
 * Save and load the realm.
 * Older saves (version 1) kept preset places. Those ideas are lifted onto
 * their own kingdoms so coins, tasks, and the hall are not thrown away.
 */

import { STORAGE_KEY } from '../config/app.ts'
import { HOME } from '../config/world.ts'
import { createKingdom } from './logic.ts'
import type { GameState, Kingdom, Motif, Priority, QuestResource, ResourceKind, StartStep, Task, ToolkitItem } from './types.ts'

export function freshState(): GameState {
  return {
    version: 2,
    onboarded: false,
    kingdoms: [],
    coins: 0,
    lifetimeCoins: 0,
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    completions: [],
    ownedItemIds: [],
    heroPlaceId: HOME.id,
    toolkit: [],
  }
}

const MOTIFS = new Set<Motif>([
  'hearth',
  'clockwork',
  'bard',
  'road',
  'shrine',
  'keep',
  'lens',
  'grove',
  'library',
  'spire',
  'stage',
  'atelier',
  'mill',
  'water',
])

function asMotif(value: unknown, fallback: Motif): Motif {
  return typeof value === 'string' && MOTIFS.has(value as Motif) ? (value as Motif) : fallback
}

type LegacyTask = { id?: string; label?: string; coins?: number; xp?: number; done?: boolean }
type LegacyQuest = { id?: string; idea?: string; title?: string; tasks?: LegacyTask[] }

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data: unknown = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    const record = data as Record<string, unknown>
    if (record.version === 2 && Array.isArray(record.kingdoms)) return sanitize(record)
    if (record.version === 1 && Array.isArray(record.quests)) return migrateV1(record)
    return null
  } catch {
    return null
  }
}

function shared(record: Record<string, unknown>, base: GameState): GameState {
  const hero = typeof record.heroPlaceId === 'string' ? record.heroPlaceId : HOME.id
  const known = new Set(base.kingdoms.map((kingdom) => kingdom.id))
  return {
    ...base,
    onboarded: Boolean(record.onboarded),
    coins: Number(record.coins) || 0,
    lifetimeCoins: Number(record.lifetimeCoins) || 0,
    xp: Number(record.xp) || 0,
    streak: Number(record.streak) || 0,
    lastActiveDate: typeof record.lastActiveDate === 'string' ? record.lastActiveDate : null,
    completions: Array.isArray(record.completions) ? (record.completions as GameState['completions']) : [],
    ownedItemIds: Array.isArray(record.ownedItemIds) ? (record.ownedItemIds as string[]) : [],
    heroPlaceId: hero === HOME.id || known.has(hero) ? hero : HOME.id,
  }
}

function sanitize(record: Record<string, unknown>): GameState {
  const kingdoms = (record.kingdoms as Partial<Kingdom>[]).map((kingdom, index) => sanitizeKingdom(kingdom, index))
  const toolkit = sanitizeToolkit(record.toolkit, kingdoms)
  return shared(record, { ...freshState(), kingdoms, toolkit })
}

function sanitizeKingdom(kingdom: Partial<Kingdom>, index: number): Kingdom {
  const idea = typeof kingdom.originalIdea === 'string' ? kingdom.originalIdea : 'An unnamed idea'
  const drafted = createKingdom(idea, [], index)
  return {
    ...drafted,
    ...kingdom,
    id: typeof kingdom.id === 'string' ? kingdom.id : drafted.id,
    originalIdea: idea,
    generatedName: typeof kingdom.generatedName === 'string' ? kingdom.generatedName : drafted.generatedName,
    description: typeof kingdom.description === 'string' ? kingdom.description : drafted.description,
    motif: asMotif(kingdom.motif, drafted.motif),
    x: Number(kingdom.x) || drafted.x,
    y: Number(kingdom.y) || drafted.y,
    tasks: Array.isArray(kingdom.tasks) ? kingdom.tasks.map(sanitizeTask) : [],
    seen: kingdom.seen !== false,
    createdAt: Number(kingdom.createdAt) || drafted.createdAt,
  }
}

function sanitizeTask(task: Partial<Task>, index: number): Task {
  const priority: Priority = task.priority === 'high' || task.priority === 'low' ? task.priority : 'medium'
  return {
    id: typeof task.id === 'string' ? task.id : `task-${index}`,
    label: typeof task.label === 'string' ? task.label : 'Untitled quest',
    description: typeof task.description === 'string' ? task.description : '',
    priority,
    coins: Number(task.coins) || 15,
    xp: Number(task.xp) || 12,
    done: Boolean(task.done),
    createdAt: Number(task.createdAt) || Date.now() + index,
    deadline: typeof task.deadline === 'string' ? task.deadline : null,
    minutes: Number(task.minutes) > 0 ? Number(task.minutes) : null,
    resources: Array.isArray(task.resources) ? task.resources.map(sanitizeResource).filter((item) => item !== null) : [],
    startPath: Array.isArray(task.startPath) ? task.startPath.map(sanitizeStep).filter((item) => item !== null) : [],
    supplyKey: typeof task.supplyKey === 'string' ? task.supplyKey : '',
  }
}

const RESOURCE_KINDS = new Set<ResourceKind>(['watch', 'read', 'explore', 'get', 'go', 'tool', 'checklist', 'inspire'])

function sanitizeResource(value: unknown, index: number): QuestResource | null {
  if (!value || typeof value !== 'object') return null
  const resource = value as Partial<QuestResource>
  if (typeof resource.title !== 'string' || !resource.title.trim()) return null
  if (typeof resource.kind !== 'string' || !RESOURCE_KINDS.has(resource.kind)) return null
  const url = typeof resource.url === 'string' && /^https:\/\//.test(resource.url) ? resource.url : null
  return {
    id: typeof resource.id === 'string' ? resource.id : `resource-${index}`,
    kind: resource.kind,
    title: resource.title.trim(),
    source: typeof resource.source === 'string' ? resource.source : '',
    why: typeof resource.why === 'string' ? resource.why : '',
    url,
    minutes: Number(resource.minutes) > 0 ? Number(resource.minutes) : null,
    saved: Boolean(resource.saved),
    viewed: Boolean(resource.viewed),
  }
}

function sanitizeStep(value: unknown): StartStep | null {
  if (!value || typeof value !== 'object') return null
  const step = value as Partial<StartStep>
  if (typeof step.title !== 'string' || !step.title.trim()) return null
  const kind = step.kind === 'act' || (typeof step.kind === 'string' && RESOURCE_KINDS.has(step.kind)) ? step.kind : 'act'
  return {
    title: step.title.trim(),
    detail: typeof step.detail === 'string' ? step.detail : '',
    kind,
  }
}

function sanitizeToolkit(value: unknown, kingdoms: Kingdom[]): ToolkitItem[] {
  const known = new Set(kingdoms.map((kingdom) => kingdom.id))
  const stored = Array.isArray(value) ? value.map(sanitizeToolkitItem).filter((item) => item !== null) : null
  const items: ToolkitItem[] = []
  const seen = new Set<string>()
  const push = (item: ToolkitItem) => {
    if (!known.has(item.kingdomId) || seen.has(item.id)) return
    seen.add(item.id)
    items.push(item)
  }
  if (stored) {
    stored.forEach(push)
    return items
  }
  for (const kingdom of kingdoms) {
    for (const task of kingdom.tasks) {
      for (const resource of task.resources) {
        if (!resource.saved) continue
        push({
          id: resource.id,
          title: resource.title,
          url: resource.url,
          kind: resource.kind,
          source: resource.source,
          why: resource.why,
          minutes: resource.minutes,
          kingdomId: kingdom.id,
          kingdomName: kingdom.generatedName,
          motif: kingdom.motif,
          questId: task.id,
          questTitle: task.label,
          savedAt: task.createdAt,
        })
      }
    }
  }
  return items
}

function sanitizeToolkitItem(value: unknown): ToolkitItem | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Partial<ToolkitItem>
  if (typeof item.id !== 'string' || typeof item.title !== 'string' || !item.title.trim()) return null
  if (typeof item.kind !== 'string' || !RESOURCE_KINDS.has(item.kind)) return null
  if (typeof item.kingdomId !== 'string' || typeof item.questId !== 'string') return null
  const url = typeof item.url === 'string' && /^https:\/\//.test(item.url) ? item.url : null
  return {
    id: item.id,
    title: item.title.trim(),
    url,
    kind: item.kind,
    source: typeof item.source === 'string' ? item.source : '',
    why: typeof item.why === 'string' ? item.why : '',
    minutes: Number(item.minutes) > 0 ? Number(item.minutes) : null,
    kingdomId: item.kingdomId,
    kingdomName: typeof item.kingdomName === 'string' ? item.kingdomName : 'A kingdom',
    motif: asMotif(item.motif, 'mill'),
    questId: item.questId,
    questTitle: typeof item.questTitle === 'string' ? item.questTitle : 'A quest',
    savedAt: Number(item.savedAt) || Date.now(),
  }
}

function migrateV1(record: Record<string, unknown>): GameState {
  const quests = record.quests as LegacyQuest[]
  const kingdoms: Kingdom[] = []
  quests.forEach((quest, index) => {
    const idea = (quest.idea || quest.title || 'An unnamed idea').trim()
    const kingdom = createKingdom(idea, kingdoms, index)
    kingdom.id = typeof quest.id === 'string' ? quest.id : kingdom.id
    kingdom.seen = true
    kingdom.tasks = (quest.tasks ?? []).map((task, taskIndex) => ({
      id: typeof task.id === 'string' ? task.id : `${kingdom.id}-task-${taskIndex}`,
      label: typeof task.label === 'string' ? task.label : 'Untitled quest',
      description: '',
      priority: 'medium',
      coins: Number(task.coins) || 30,
      xp: Number(task.xp) || 25,
      done: Boolean(task.done),
      createdAt: Date.now() + taskIndex,
      deadline: null,
      minutes: null,
      resources: [],
      startPath: [],
      supplyKey: '',
    }))
    kingdoms.push(kingdom)
  })
  return shared(record, { ...freshState(), kingdoms, onboarded: Boolean(record.onboarded) })
}

export function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY)
}
