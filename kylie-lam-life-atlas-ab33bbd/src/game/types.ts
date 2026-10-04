/** Shapes stored in localStorage and passed through the app. */

export type Priority = 'high' | 'medium' | 'low'

export type TaskSort = 'priority' | 'order' | 'completion' | 'recent'

/** How a kingdom is drawn. The idea chooses this; it is not a preset place. */
export type Motif =
  | 'hearth'
  | 'clockwork'
  | 'bard'
  | 'road'
  | 'shrine'
  | 'keep'
  | 'lens'
  | 'grove'
  | 'library'
  | 'spire'
  | 'stage'
  | 'atelier'
  | 'mill'
  | 'water'

/** A kind of help attached to one quest. Not every quest uses every kind. */
export type ResourceKind = 'watch' | 'read' | 'explore' | 'get' | 'go' | 'tool' | 'checklist' | 'inspire'

/**
 * One curated aid for a single quest.
 * `url` is set only for a page that was checked. A null url is a note written
 * for the quest, not a link.
 */
export type QuestResource = {
  id: string
  kind: ResourceKind
  title: string
  source: string
  why: string
  url: string | null
  minutes: number | null
  saved: boolean
  viewed: boolean
}

/** One step in "Help me start". Reading a step does not finish the quest. */
export type StartStep = {
  title: string
  detail: string
  kind: ResourceKind | 'act'
}

export type Task = {
  id: string
  label: string
  description: string
  priority: Priority
  coins: number
  xp: number
  done: boolean
  /** When the player added the quest. Newest sorts by this. */
  createdAt: number
  /** YYYY-MM-DD, or null when the quest has no date. */
  deadline: string | null
  /** Minutes the quest is expected to take, or null if unset. */
  minutes: number | null
  /** Aids for this quest only. Empty until the player asks for them. */
  resources: QuestResource[]
  /** Ordered first steps. Empty until the player asks how to begin. */
  startPath: StartStep[]
  /**
   * Quest text these supplies were chosen for.
   * Empty until Help me start runs. A new title or description asks again.
   */
  supplyKey: string
}

/**
 * One of the player's ideas, drawn as its own land.
 * Coins, XP, and progress are counted from `tasks` so they cannot drift.
 */
export type Kingdom = {
  id: string
  originalIdea: string
  generatedName: string
  description: string
  category: string
  motif: Motif
  /** 0–4, so two kingdoms of the same kind are not identical. */
  tint: number
  x: number
  y: number
  heroDx: number
  heroDy: number
  bend: number
  label: 'above' | 'below'
  tasks: Task[]
  createdAt: number
  /** False until the discovery animation has played. */
  seen: boolean
}

/**
 * A resource the player chose to keep.
 * It is a copy of a quest aid, with the land and quest it came from.
 * Removing it does not remove the aid from Help me start.
 */
export type ToolkitItem = {
  id: string
  title: string
  url: string | null
  kind: ResourceKind
  source: string
  why: string
  minutes: number | null
  kingdomId: string
  kingdomName: string
  motif: Motif
  questId: string
  questTitle: string
  savedAt: number
}

export type GameState = {
  version: 2
  onboarded: boolean
  kingdoms: Kingdom[]
  /** Bookmarks gathered from Help me start. */
  toolkit: ToolkitItem[]
  /** Coins currently in the purse (purchases spend these). */
  coins: number
  /** Coins ever earned. This number never goes down. */
  lifetimeCoins: number
  xp: number
  streak: number
  lastActiveDate: string | null
  completions: Completion[]
  ownedItemIds: string[]
  /** 'home', or the id of the kingdom where the hero last arrived. */
  heroPlaceId: string
}

export type Completion = {
  taskId: string
  /** Calendar day, YYYY-MM-DD, in the player's local timezone. */
  date: string
}

export type ViewId = 'map' | 'quests' | 'toolkit' | 'homebase' | 'journey'

export type CoinFlight = {
  id: string
  x: number
  y: number
  dx: number
  dy: number
  delay: number
}

export type TaskDraft = {
  label: string
  description: string
  priority: Priority
  coins: number
  deadline: string | null
  minutes: number | null
}
