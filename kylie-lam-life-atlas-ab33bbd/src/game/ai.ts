/**
 * Asks this app's /api/ai route to draft Help me start guides and Scribe quests.
 * The key lives in this browser and is forwarded by the route. With no key,
 * or if the call fails, the local shelf and the local scribe still answer.
 */

import { useEffect, useState } from 'react'
import type { Stage } from './domains.ts'
import type { SupplyQuery } from './resources.ts'
import { rewardFor } from './rewards.ts'
import type { ScribeBrief, ScribeMode, Suggestion } from './scribe.ts'
import type { Priority, QuestResource, ResourceKind, StartStep } from './types.ts'

const KEY_STORAGE = 'sidequest-ai-key'

export class AiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AiError'
    this.status = status
  }
}

/** True when the failure is "no key", so the local answer needs no warning. */
export function aiUnconfigured(error: unknown): boolean {
  return error instanceof AiError && error.status === 503
}

const KINDS = new Set<ResourceKind>(['watch', 'read', 'explore', 'get', 'go', 'tool', 'checklist', 'inspire'])

export function getAiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE)?.trim() ?? ''
  } catch {
    return ''
  }
}

export function setAiKey(key: string): void {
  try {
    const trimmed = key.trim()
    if (trimmed) localStorage.setItem(KEY_STORAGE, trimmed)
    else localStorage.removeItem(KEY_STORAGE)
  } catch {
    // The shelf still answers if the key cannot be stored.
  }
  window.dispatchEvent(new Event('sidequest-ai-key'))
}

export function useAiKey(): [string, (key: string) => void] {
  const [key, setKey] = useState(getAiKey)
  useEffect(() => {
    const sync = () => setKey(getAiKey())
    window.addEventListener('sidequest-ai-key', sync)
    return () => window.removeEventListener('sidequest-ai-key', sync)
  }, [])
  return [key, setAiKey]
}

const serverKeyPromise: Promise<boolean> =
  typeof window === 'undefined'
    ? Promise.resolve(false)
    : fetch('/api/ai', { signal: AbortSignal.timeout(2500) })
        .then(async (response) => {
          if (!response.ok) return false
          const body = (await response.json()) as { configured?: boolean }
          return Boolean(body.configured)
        })
        .catch(() => false)

/** True when a pasted key or a server OPENAI_API_KEY can answer. */
export async function aiWillAnswer(localKey: string): Promise<boolean> {
  if (localKey.trim()) return true
  return serverKeyPromise
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).trim()
}

function asUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:') return null
    if (url.hostname === 'example.com' || url.hostname.endsWith('.example')) return null
    return url.toString()
  } catch {
    return null
  }
}

function asKind(value: unknown, fallback: ResourceKind): ResourceKind {
  return typeof value === 'string' && KINDS.has(value as ResourceKind) ? (value as ResourceKind) : fallback
}

/** Turn a model JSON string into quest supplies. Null when the draft is unusable. */
export function parseAiDraft(raw: string): { resources: QuestResource[]; startPath: StartStep[] } | null {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null
  const record = data as { resources?: unknown; startPath?: unknown }
  if (!Array.isArray(record.resources)) return null

  const seen = new Set<string>()
  const resources: QuestResource[] = []
  for (const item of record.resources) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    if (typeof row.title !== 'string' || !row.title.trim()) continue
    const url = asUrl(row.url)
    if (url && seen.has(url)) continue
    if (url) seen.add(url)
    const source = typeof row.source === 'string' && row.source.trim() ? clip(row.source, 80) : url ? 'Web' : 'Written for this quest'
    resources.push({
      id: crypto.randomUUID(),
      kind: asKind(row.kind, 'read'),
      title: clip(row.title, 120),
      source: url ? source : source === 'Web' ? 'Written for this quest' : source,
      why: typeof row.why === 'string' ? clip(row.why, 420) : '',
      url,
      minutes: Number(row.minutes) > 0 ? Math.min(180, Math.round(Number(row.minutes))) : null,
      saved: false,
      viewed: false,
    })
    if (resources.length >= 5) break
  }
  if (resources.length < 2) return null

  const startPath: StartStep[] = []
  if (Array.isArray(record.startPath)) {
    for (const item of record.startPath) {
      if (!item || typeof item !== 'object') continue
      const row = item as Record<string, unknown>
      if (typeof row.title !== 'string' || !row.title.trim()) continue
      const kind = row.kind === 'act' || (typeof row.kind === 'string' && KINDS.has(row.kind as ResourceKind)) ? row.kind : 'act'
      startPath.push({
        kind: kind as StartStep['kind'],
        title: clip(row.title, 120),
        detail: typeof row.detail === 'string' ? clip(row.detail, 280) : '',
      })
      if (startPath.length >= 4) break
    }
  }
  if (startPath.length === 0) {
    startPath.push({
      kind: 'act',
      title: resources[0].title,
      detail: 'Do the quest itself. Opening a guide does not finish it.',
    })
  }
  return { resources, startPath }
}

const STAGES = new Set<Stage>(['Foundation', 'Practice', 'Application', 'Challenge', 'Reflection'])

export type QuestAsk = {
  idea: string
  kingdomName: string
  kingdomDescription: string
  category: string
  existingLabels: string[]
  brief: ScribeBrief
  mode: ScribeMode
}

function priorityFor(difficulty: 1 | 2 | 3): Priority {
  if (difficulty === 1) return 'low'
  if (difficulty === 3) return 'high'
  return 'medium'
}

/** Turn model quest JSON into suggestions. Coins and XP stay on the local reward table. */
export function parseAiQuests(raw: string, existingLabels: string[]): Suggestion[] | null {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null
  const rows = (data as { quests?: unknown }).quests
  if (!Array.isArray(rows)) return null
  const taken = new Set(existingLabels.map((label) => label.trim().toLowerCase()))
  const suggestions: Suggestion[] = []
  for (const item of rows) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    if (typeof row.title !== 'string' || !row.title.trim()) continue
    if (typeof row.action !== 'string' || !row.action.trim()) continue
    const title = clip(row.title, 80)
    if (taken.has(title.toLowerCase())) continue
    taken.add(title.toLowerCase())
    const difficulty: 1 | 2 | 3 = row.difficulty === 1 || row.difficulty === 3 ? row.difficulty : 2
    const stage = typeof row.stage === 'string' && STAGES.has(row.stage as Stage) ? (row.stage as Stage) : 'Practice'
    const priority = priorityFor(difficulty)
    const reward = rewardFor(priority)
    const minutes = Number(row.minutes) > 0 ? Math.min(180, Math.max(5, Math.round(Number(row.minutes)))) : 25
    const why = typeof row.why === 'string' ? clip(row.why, 280) : ''
    const action = clip(row.action, 280)
    suggestions.push({
      id: crypto.randomUUID(),
      title,
      action,
      why,
      stage,
      difficulty,
      priority,
      coins: reward.coins,
      xp: reward.xp,
      minutes,
      label: title,
      description: why ? `${action} ${why}` : action,
    })
    if (suggestions.length >= 5) break
  }
  return suggestions.length >= 2 ? suggestions : null
}

async function postAi(purpose: 'resources' | 'quests', key: string, payload: unknown): Promise<unknown> {
  let response: Response
  try {
    response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purpose, key, payload }),
      signal: AbortSignal.timeout(50000),
    })
  } catch {
    throw new AiError('The guide could not be reached.', 0)
  }
  let body: { error?: string } = {}
  try {
    body = (await response.json()) as { error?: string }
  } catch {
    body = {}
  }
  if (!response.ok) {
    if (response.status === 401) throw new AiError('That API key was refused. Check it on the Journey screen.', 401)
    if (response.status === 503) throw new AiError('No API key is set.', 503)
    const message = typeof body.error === 'string' && body.error ? clip(body.error, 180) : 'The AI guide could not answer.'
    throw new AiError(message, response.status)
  }
  return body
}

/** Ask the guide for resources for this quest. Throws when the draft cannot be used. */
export async function draftSupplies(query: SupplyQuery, key: string): Promise<{ resources: QuestResource[]; startPath: StartStep[] }> {
  const body = await postAi('resources', key, {
    idea: query.idea,
    kingdomName: query.kingdomName,
    kingdomDescription: query.kingdomDescription,
    category: query.category,
    questLabel: query.questLabel,
    questDescription: query.questDescription,
    priority: query.priority,
    minutes: query.minutes,
    usedUrls: query.usedUrls,
  })
  const draft = parseAiDraft(JSON.stringify(body))
  if (!draft) throw new AiError('The AI guide did not return usable resources.', 502)
  return draft
}

/** Ask the guide for quests. Throws when the draft cannot be used. Rewards stay local. */
export async function draftQuests(ask: QuestAsk, key: string): Promise<Suggestion[]> {
  const body = await postAi('quests', key, ask)
  const suggestions = parseAiQuests(JSON.stringify(body), ask.existingLabels)
  if (!suggestions) throw new AiError('The AI guide did not return usable quests.', 502)
  return suggestions
}
