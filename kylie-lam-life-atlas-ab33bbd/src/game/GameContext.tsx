/**
 * Shared game state.
 * `state` is the part that is saved. The open screen, the quest scroll,
 * and flying coins are not saved — they reset when you reload.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { APP_NAME } from '../config/app.ts'
import { shopItemById } from '../config/shop.ts'
import { GameContext, type BeginResult, type BuyResult, type GameApi, type TravelRequest } from './context.ts'
import {
  applyCompletion,
  applyPurchase,
  createKingdomsFromText,
  levelCrossing,
  levelProgress,
  reorderVisible,
  taskFromDraft,
  visibleStreak,
} from './logic.ts'
import { playCoins, playLevelUp, playPlace } from './sound.ts'
import { clearState, freshState, loadState, saveState } from './storage.ts'
import type { CoinFlight, GameState, QuestResource, StartStep, TaskDraft, ViewId } from './types.ts'
import type { LevelUpMoment } from './context.ts'

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => loadState() ?? freshState())
  const stateRef = useRef(state)
  const [levelUp, setLevelUp] = useState<LevelUpMoment | null>(null)
  const [levelPulse, setLevelPulse] = useState(0)

  const commit = useCallback((next: GameState) => {
    const previousXp = stateRef.current.xp
    const crossing = levelCrossing(previousXp, next.xp)
    stateRef.current = next
    setState(next)
    if (crossing) {
      setLevelUp({ from: crossing.from, to: crossing.to, xpGained: next.xp - previousXp })
      playLevelUp()
    }
  }, [])

  const [view, setView] = useState<ViewId>('map')
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null)
  const [travel, setTravel] = useState<TravelRequest | null>(null)
  const [flights, setFlights] = useState<CoinFlight[]>([])
  const [herald, setHerald] = useState<string | null>(null)
  const [cheer, setCheer] = useState(0)
  const [toolkitFocus, setToolkitFocus] = useState<string | null>(null)
  const handledTravel = useRef(0)
  const travelSerial = useRef(0)

  useEffect(() => {
    document.title = APP_NAME
  }, [])

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    if (!herald) return
    const timer = window.setTimeout(() => setHerald(null), 3800)
    return () => window.clearTimeout(timer)
  }, [herald])

  const announce = useCallback((count: number) => {
    setHerald(count === 1 ? 'A new path has appeared.' : 'Your world expands.')
  }, [])

  const launchCoins = useCallback((origin: { x: number; y: number }) => {
    const target = document.getElementById('coin-target')?.getBoundingClientRect()
    const tx = (target?.left ?? window.innerWidth - 48) + (target?.width ?? 0) / 2
    const ty = (target?.top ?? 24) + (target?.height ?? 0) / 2
    const batch: CoinFlight[] = [0, 1, 2].map((index) => {
      const x = origin.x + (index - 1) * 14
      const y = origin.y - index * 2
      return {
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        x,
        y,
        dx: tx - x,
        dy: ty - y,
        delay: index * 90,
      }
    })
    setFlights((prev) => [...prev, ...batch])
    window.setTimeout(() => {
      setFlights((prev) => prev.filter((flight) => !batch.some((item) => item.id === flight.id)))
    }, 1200)
  }, [])

  const beginAdventure = useCallback(
    (raw: string): BeginResult => {
      const { kingdoms, trimmed, full } = createKingdomsFromText(raw)
      if (full || kingdoms.length === 0) return { ok: false, reason: 'Write at least one idea — even a messy one.' }
      commit({ ...freshState(), onboarded: true, kingdoms })
      setView('map')
      setOpenPlaceId(null)
      setTravel(null)
      announce(kingdoms.length)
      return { ok: true, trimmed }
    },
    [announce, commit],
  )

  const enterRealm = useCallback(() => {
    commit({ ...freshState(), onboarded: true })
    setView('map')
    setOpenPlaceId(null)
    setTravel(null)
  }, [commit])

  const addIdea = useCallback(
    (raw: string): BeginResult => {
      const current = stateRef.current
      const { kingdoms, trimmed, full } = createKingdomsFromText(raw, current.kingdoms)
      if (full) return { ok: false, reason: 'The map is holding as many lands as it can.' }
      if (kingdoms.length === 0) return { ok: false, reason: 'Write an idea first.' }
      commit({ ...current, kingdoms: [...current.kingdoms, ...kingdoms] })
      announce(kingdoms.length)
      return { ok: true, trimmed }
    },
    [announce, commit],
  )

  const addTask = useCallback(
    (kingdomId: string, draft: TaskDraft): string | null => {
      if (!draft.label.trim()) return null
      const task = taskFromDraft(draft)
      const current = stateRef.current
      commit({
        ...current,
        kingdoms: current.kingdoms.map((kingdom) =>
          kingdom.id === kingdomId ? { ...kingdom, tasks: [...kingdom.tasks, task] } : kingdom,
        ),
      })
      return task.id
    },
    [commit],
  )

  const updateTask = useCallback(
    (kingdomId: string, taskId: string, draft: TaskDraft) => {
      if (!draft.label.trim()) return
      const current = stateRef.current
      const next = taskFromDraft(draft)
      const label = next.label
      commit({
        ...current,
        toolkit: current.toolkit.map((item) => (item.questId === taskId ? { ...item, questTitle: label } : item)),
        kingdoms: current.kingdoms.map((kingdom) =>
          kingdom.id !== kingdomId
            ? kingdom
            : {
                ...kingdom,
                tasks: kingdom.tasks.map((task) =>
                  task.id !== taskId || task.done
                    ? task
                    : {
                        ...next,
                        id: task.id,
                        createdAt: task.createdAt,
                        done: false,
                        resources: task.resources,
                        startPath: task.startPath,
                        supplyKey: task.supplyKey,
                      },
                ),
              },
        ),
      })
    },
    [commit],
  )

  const dismissLevelUp = useCallback(() => {
    setLevelUp(null)
    setLevelPulse((value) => value + 1)
  }, [])

  const setSupplies = useCallback(
    (kingdomId: string, taskId: string, supplies: { resources: QuestResource[]; startPath: StartStep[]; supplyKey: string }) => {
      const current = stateRef.current
      commit({
        ...current,
        kingdoms: current.kingdoms.map((kingdom) =>
          kingdom.id !== kingdomId
            ? kingdom
            : {
                ...kingdom,
                tasks: kingdom.tasks.map((task) => (task.id === taskId ? { ...task, ...supplies } : task)),
              },
        ),
      })
    },
    [commit],
  )

  const patchResource = useCallback(
    (kingdomId: string, taskId: string, resourceId: string, patch: { viewed: boolean }) => {
      const current = stateRef.current
      commit({
        ...current,
        kingdoms: current.kingdoms.map((kingdom) =>
          kingdom.id !== kingdomId
            ? kingdom
            : {
                ...kingdom,
                tasks: kingdom.tasks.map((task) =>
                  task.id !== taskId
                    ? task
                    : {
                        ...task,
                        resources: task.resources.map((resource) =>
                          resource.id === resourceId ? { ...resource, ...patch } : resource,
                        ),
                      },
                ),
              },
        ),
      })
    },
    [commit],
  )

  const bookmarkResource = useCallback((kingdomId: string, taskId: string, resourceId: string) => {
    const current = stateRef.current
    if (current.toolkit.some((item) => item.id === resourceId)) return
    const kingdom = current.kingdoms.find((item) => item.id === kingdomId)
    const task = kingdom?.tasks.find((item) => item.id === taskId)
    const resource = task?.resources.find((item) => item.id === resourceId)
    if (!kingdom || !task || !resource) return
    commit({
      ...current,
      toolkit: [
        {
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
          savedAt: Date.now(),
        },
        ...current.toolkit,
      ],
    })
  }, [commit])

  const forgetBookmark = useCallback((resourceId: string) => {
    const current = stateRef.current
    commit({ ...current, toolkit: current.toolkit.filter((item) => item.id !== resourceId) })
  }, [commit])

  const openToolkit = useCallback((kingdomId?: string | null) => {
    setToolkitFocus(kingdomId ?? null)
    setOpenPlaceId(null)
    setView('toolkit')
  }, [])

  const removeTask = useCallback(
    (kingdomId: string, taskId: string) => {
      const current = stateRef.current
      commit({
        ...current,
        toolkit: current.toolkit.filter((item) => item.questId !== taskId),
        kingdoms: current.kingdoms.map((kingdom) =>
          kingdom.id === kingdomId
            ? { ...kingdom, tasks: kingdom.tasks.filter((task) => task.id !== taskId || task.done) }
            : kingdom,
        ),
      })
    },
    [commit],
  )

  const reorderTasks = useCallback(
    (kingdomId: string, visibleIds: string[], fromId: string, toId: string) => {
      const current = stateRef.current
      commit({
        ...current,
        kingdoms: current.kingdoms.map((kingdom) =>
          kingdom.id === kingdomId
            ? { ...kingdom, tasks: reorderVisible(kingdom.tasks, visibleIds, fromId, toId) }
            : kingdom,
        ),
      })
    },
    [commit],
  )

  const removeKingdom = useCallback(
    (kingdomId: string) => {
      const current = stateRef.current
      const kingdom = current.kingdoms.find((item) => item.id === kingdomId)
      if (!kingdom) return
      const taskIds = new Set(kingdom.tasks.map((task) => task.id))
      commit({
        ...current,
        kingdoms: current.kingdoms.filter((item) => item.id !== kingdomId),
        heroPlaceId: current.heroPlaceId === kingdomId ? 'home' : current.heroPlaceId,
        completions: current.completions.filter((entry) => !taskIds.has(entry.taskId)),
        toolkit: current.toolkit.filter((item) => item.kingdomId !== kingdomId),
      })
      setToolkitFocus((focus) => (focus === kingdomId ? null : focus))
      setOpenPlaceId((open) => (open === kingdomId ? null : open))
    },
    [commit],
  )

  const updateKingdom = useCallback(
    (kingdomId: string, patch: { generatedName: string; description: string }) => {
      const name = patch.generatedName.trim()
      if (!name) return
      const current = stateRef.current
      commit({
        ...current,
        kingdoms: current.kingdoms.map((kingdom) =>
          kingdom.id === kingdomId ? { ...kingdom, generatedName: name, description: patch.description.trim() } : kingdom,
        ),
        toolkit: current.toolkit.map((item) => (item.kingdomId === kingdomId ? { ...item, kingdomName: name } : item)),
      })
    },
    [commit],
  )

  const acknowledgeLands = useCallback(
    (ids: string[]) => {
      const current = stateRef.current
      if (!current.kingdoms.some((kingdom) => ids.includes(kingdom.id) && !kingdom.seen)) return
      commit({
        ...current,
        kingdoms: current.kingdoms.map((kingdom) => (ids.includes(kingdom.id) ? { ...kingdom, seen: true } : kingdom)),
      })
    },
    [commit],
  )

  const completeTask = useCallback(
    (kingdomId: string, taskId: string, origin?: { x: number; y: number }) => {
      const beforeXp = stateRef.current.xp
      const next = applyCompletion(stateRef.current, kingdomId, taskId)
      if (!next) return
      const crossed = levelCrossing(beforeXp, next.xp)
      commit(next)
      if (!crossed) playCoins()
      setCheer((value) => value + 1)
      if (origin) launchCoins(origin)
    },
    [commit, launchCoins],
  )

  const buyItem = useCallback(
    (itemId: string): BuyResult => {
      const current = stateRef.current
      const item = shopItemById(itemId)
      if (!item) return { ok: false, reason: 'That furnishing is not in the catalog.' }
      if (current.ownedItemIds.includes(itemId)) return { ok: false, reason: 'Already placed in the hall.' }
      if (current.coins < item.price) {
        return { ok: false, reason: `You need ${item.price - current.coins} more coins.` }
      }
      const next = applyPurchase(current, itemId)
      if (!next) return { ok: false, reason: 'The hall could not take that.' }
      commit(next)
      playPlace()
      return { ok: true }
    },
    [commit],
  )

  const reset = useCallback(() => {
    clearState()
    const next = freshState()
    commit(next)
    setView('map')
    setOpenPlaceId(null)
    setTravel(null)
    setFlights([])
    setHerald(null)
  }, [commit])

  const moveHero = useCallback(
    (placeId: string) => {
      if (stateRef.current.heroPlaceId === placeId) return
      commit({ ...stateRef.current, heroPlaceId: placeId })
    },
    [commit],
  )

  const travelTo = useCallback((placeId: string) => {
    travelSerial.current += 1
    setView('map')
    setOpenPlaceId(null)
    setTravel({ placeId, token: travelSerial.current })
  }, [])

  const progress = levelProgress(state.xp)
  const streak = visibleStreak(state)

  const api = useMemo<GameApi>(
    () => ({
      state,
      view,
      setView,
      openPlaceId,
      setOpenPlaceId,
      travel,
      handledTravel,
      travelTo,
      moveHero,
      level: progress.level,
      levelTitle: progress.title,
      xpInto: progress.into,
      xpNeed: progress.need,
      streak,
      flights,
      cheer,
      levelUp,
      dismissLevelUp,
      levelPulse,
      herald,
      toolkitFocus,
      beginAdventure,
      enterRealm,
      addIdea,
      addTask,
      updateTask,
      setSupplies,
      patchResource,
      bookmarkResource,
      forgetBookmark,
      openToolkit,
      removeTask,
      removeKingdom,
      updateKingdom,
      reorderTasks,
      acknowledgeLands,
      completeTask,
      buyItem,
      reset,
    }),
    [
      state,
      view,
      openPlaceId,
      travel,
      travelTo,
      moveHero,
      progress.level,
      progress.title,
      progress.into,
      progress.need,
      streak,
      flights,
      cheer,
      levelUp,
      dismissLevelUp,
      levelPulse,
      herald,
      toolkitFocus,
      beginAdventure,
      enterRealm,
      addIdea,
      addTask,
      updateTask,
      setSupplies,
      patchResource,
      bookmarkResource,
      forgetBookmark,
      openToolkit,
      removeTask,
      removeKingdom,
      updateKingdom,
      reorderTasks,
      acknowledgeLands,
      completeTask,
      buyItem,
      reset,
    ],
  )

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>
}
