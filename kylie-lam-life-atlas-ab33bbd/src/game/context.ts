/**
 * The shared game context. The provider lives in GameContext.tsx;
 * this file only holds the hook so components can read the game.
 */

import { createContext, useContext, type RefObject } from 'react'
import type { CoinFlight, GameState, QuestResource, StartStep, TaskDraft, ViewId } from './types.ts'

export type TravelRequest = { placeId: string; token: number }

export type BeginResult = { ok: true; trimmed: boolean } | { ok: false; reason: string }
export type BuyResult = { ok: true } | { ok: false; reason: string }

/** Shown once, when earned XP crosses one or more level thresholds. */
export type LevelUpMoment = {
  from: number
  to: number
  xpGained: number
}

export type GameApi = {
  state: GameState
  view: ViewId
  setView: (view: ViewId) => void
  openPlaceId: string | null
  setOpenPlaceId: (placeId: string | null) => void
  travel: TravelRequest | null
  /** Remembered so opening the map later does not replay an old walk. */
  handledTravel: RefObject<number>
  travelTo: (placeId: string) => void
  moveHero: (placeId: string) => void
  level: number
  levelTitle: string
  xpInto: number
  xpNeed: number
  streak: number
  flights: CoinFlight[]
  /** Bumps when a quest is completed, so the hero can celebrate. */
  cheer: number
  /** Set only when the player's level increases. Null the rest of the time. */
  levelUp: LevelUpMoment | null
  dismissLevelUp: () => void
  /** Bumps after the level-up page closes, so the shield can gleam. */
  levelPulse: number
  /** A short line shown when new land appears. Null when the map is quiet. */
  herald: string | null
  /** Kingdom shown in the Toolkit. Null means every land. */
  toolkitFocus: string | null
  beginAdventure: (raw: string) => BeginResult
  enterRealm: () => void
  addIdea: (raw: string) => BeginResult
  addTask: (kingdomId: string, draft: TaskDraft) => string | null
  updateTask: (kingdomId: string, taskId: string, draft: TaskDraft) => void
  /** Attach curated supplies to one quest. Replaces that quest's supplies only. */
  setSupplies: (
    kingdomId: string,
    taskId: string,
    supplies: { resources: QuestResource[]; startPath: StartStep[]; supplyKey: string },
  ) => void
  /** Mark a guide viewed. Does not complete the quest or bookmark it. */
  patchResource: (kingdomId: string, taskId: string, resourceId: string, patch: { viewed: boolean }) => void
  /** Keep a Help me start aid in the Toolkit. The aid stays on the quest. */
  bookmarkResource: (kingdomId: string, taskId: string, resourceId: string) => void
  /** Take a bookmark out of the Toolkit. The quest aid remains. */
  forgetBookmark: (resourceId: string) => void
  /** Open the Toolkit, optionally on one kingdom. */
  openToolkit: (kingdomId?: string | null) => void
  removeTask: (kingdomId: string, taskId: string) => void
  removeKingdom: (kingdomId: string) => void
  updateKingdom: (kingdomId: string, patch: { generatedName: string; description: string }) => void
  reorderTasks: (kingdomId: string, visibleIds: string[], fromId: string, toId: string) => void
  acknowledgeLands: (ids: string[]) => void
  completeTask: (kingdomId: string, taskId: string, origin?: { x: number; y: number }) => void
  buyItem: (itemId: string) => BuyResult
  reset: () => void
}

export const GameContext = createContext<GameApi | null>(null)

export function useGame(): GameApi {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame must be used inside GameProvider')
  return value
}
