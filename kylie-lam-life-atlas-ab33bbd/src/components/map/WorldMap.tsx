/**
 * The world map: pan, zoom, and walk the hero along the roads.
 * Clicking a land frames the journey, walks the hero, then opens that land.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { APP_NAME } from '../../config/app.ts'
import { HOME, MAP } from '../../config/world.ts'
import { useGame } from '../../game/context.ts'
import { kingdomStatus, kingdomYield, taskStats } from '../../game/logic.ts'
import {
  cameraFit,
  easeInOut,
  framePoints,
  heroPoint,
  polylineLength,
  positionAlong,
  roadD,
  routeBetween,
  sampleQuad,
  type Camera,
  type Point,
  type Site,
} from '../../game/mapMath.ts'
import type { Kingdom } from '../../game/types.ts'
import { HeroFigure } from './HeroFigure.tsx'
import { KingdomArt } from './kingdomArt.tsx'
import { HomeArt } from './landmarks.tsx'
import { MapPin } from './MapPin.tsx'
import { Terrain } from './terrain.tsx'

function pointsToPath(points: Point[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
}

function siteFor(id: string, kingdoms: Kingdom[]): Site {
  if (id === HOME.id) return HOME
  return kingdoms.find((kingdom) => kingdom.id === id) ?? HOME
}

export function WorldMap() {
  const game = useGame()
  const kingdoms = game.state.kingdoms
  const viewportRef = useRef<HTMLDivElement>(null)
  const [cam, setCam] = useState<Camera>({ x: 0, y: 0, scale: 0.55 })
  const camRef = useRef(cam)
  const userMoved = useRef(false)
  const camRaf = useRef(0)
  const heroRaf = useRef(0)
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)

  const [hero, setHero] = useState<Point>(() => heroPoint(siteFor(game.state.heroPlaceId, game.state.kingdoms)))
  const heroRef = useRef(hero)
  const placeIdRef = useRef(game.state.heroPlaceId)
  const kingdomsRef = useRef(kingdoms)

  const [face, setFace] = useState<1 | -1>(1)
  const [walking, setWalking] = useState(false)
  const walkingRef = useRef(false)
  const [activePath, setActivePath] = useState<Point[] | null>(null)
  const [lensOpen, setLensOpen] = useState(false)
  const [lensFocus, setLensFocus] = useState<string | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const [seenCheer, setSeenCheer] = useState(0)
  if (game.cheer !== seenCheer) {
    setSeenCheer(game.cheer)
    if (game.cheer > 0) setCelebrating(true)
  }

  const moveHero = game.moveHero
  const setView = game.setView
  const setOpenPlaceId = game.setOpenPlaceId
  const openPlaceId = game.openPlaceId
  const acknowledgeLands = game.acknowledgeLands
  const spotlight = openPlaceId ?? lensFocus

  const animateCam = useCallback((to: Camera, ms: number) => {
    cancelAnimationFrame(camRaf.current)
    const from = camRef.current
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const e = easeInOut(t)
      const next = {
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
        scale: from.scale + (to.scale - from.scale) * e,
      }
      camRef.current = next
      setCam(next)
      if (t < 1) camRaf.current = requestAnimationFrame(step)
    }
    camRaf.current = requestAnimationFrame(step)
  }, [])

  const fitRealm = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    userMoved.current = false
    setLensFocus(null)
    animateCam(cameraFit(el.getBoundingClientRect()), 420)
  }, [animateCam])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const apply = () => {
      if (userMoved.current) return
      const next = cameraFit(el.getBoundingClientRect())
      camRef.current = next
      setCam(next)
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      userMoved.current = true
      const rect = el.getBoundingClientRect()
      const current = camRef.current
      const scale = Math.min(2.4, Math.max(0.35, current.scale * (event.deltaY < 0 ? 1.08 : 0.92)))
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      const wx = (px - current.x) / current.scale
      const wy = (py - current.y) / current.scale
      const next = { scale, x: px - wx * scale, y: py - wy * scale }
      camRef.current = next
      setCam(next)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    if (walkingRef.current) return
    const point = heroPoint(siteFor(game.state.heroPlaceId, kingdoms))
    heroRef.current = point
    setHero(point)
  }, [game.state.heroPlaceId, kingdoms])

  useEffect(() => {
    if (!celebrating) return
    const timer = window.setTimeout(() => setCelebrating(false), 1400)
    return () => window.clearTimeout(timer)
  }, [celebrating])

  const unseenKey = kingdoms
    .filter((kingdom) => !kingdom.seen)
    .map((kingdom) => kingdom.id)
    .join(',')

  useEffect(() => {
    if (!unseenKey) return
    const ids = unseenKey.split(',')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => acknowledgeLands(ids), reduce ? 40 : 1700)
    return () => window.clearTimeout(timer)
  }, [unseenKey, acknowledgeLands])

  const finishWalk = useCallback(
    (placeId: string) => {
      moveHero(placeId)
      if (placeId === HOME.id) {
        setOpenPlaceId(null)
        setLensFocus(null)
        setView('homebase')
        return
      }
      setOpenPlaceId(placeId)
      setLensFocus(placeId)
      userMoved.current = true
    },
    [moveHero, setOpenPlaceId, setView],
  )

  const walkTo = useCallback(
    (placeId: string) => {
      if (walkingRef.current) return
      const lands = kingdomsRef.current
      const destSite = siteFor(placeId, lands)
      const dest = heroPoint(destSite)
      const from = heroRef.current
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (Math.hypot(dest.x - from.x, dest.y - from.y) < 8) {
        heroRef.current = dest
        setHero(dest)
        finishWalk(placeId)
        return
      }

      const originSite = siteFor(placeIdRef.current, lands)
      const expected = heroPoint(originSite)
      const drifted = Math.hypot(from.x - expected.x, from.y - expected.y) > 24
      const points = drifted ? sampleQuad(from, dest, destSite.bend) : routeBetween(originSite, destSite, HOME)

      setActivePath(points)
      walkingRef.current = true
      setWalking(true)
      setOpenPlaceId(null)
      setLensOpen(false)
      setLensFocus(null)
      userMoved.current = true

      const ms = reduce ? 800 : Math.min(2800, Math.max(1700, polylineLength(points) * 2.1))
      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms)
        const { point, face: nextFace } = positionAlong(points, easeInOut(t))
        heroRef.current = point
        setHero(point)
        setFace(nextFace)
        if (t < 1) {
          heroRaf.current = requestAnimationFrame(step)
        } else {
          walkingRef.current = false
          setWalking(false)
          setActivePath(null)
          finishWalk(placeId)
        }
      }
      heroRaf.current = requestAnimationFrame(step)
    },
    [finishWalk, setOpenPlaceId],
  )

  const walkRef = useRef(walkTo)

  useLayoutEffect(() => {
    camRef.current = cam
    heroRef.current = hero
    placeIdRef.current = game.state.heroPlaceId
    kingdomsRef.current = kingdoms
    walkRef.current = walkTo
  }, [cam, hero, game.state.heroPlaceId, kingdoms, walkTo])

  useEffect(() => {
    const placeId = game.openPlaceId
    if (!placeId || placeId === HOME.id) return
    const el = viewportRef.current
    if (!el) return
    const timer = window.setTimeout(() => {
      const rect = el.getBoundingClientRect()
      if (rect.width < 40) return
      const point = heroPoint(siteFor(placeId, kingdomsRef.current))
      userMoved.current = true
      animateCam(framePoints(point, point, rect, 0, 1.55), 520)
    }, 80)
    return () => window.clearTimeout(timer)
  }, [game.openPlaceId, animateCam])

  useEffect(() => {
    const request = game.travel
    if (!request) return
    if (game.handledTravel.current === request.token) return
    const token = request.token
    const placeId = request.placeId
    const timer = window.setTimeout(() => {
      if (game.handledTravel.current === token) return
      game.handledTravel.current = token
      walkRef.current(placeId)
    }, 40)
    return () => window.clearTimeout(timer)
  }, [game.travel, game.handledTravel])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(camRaf.current)
      cancelAnimationFrame(heroRaf.current)
      walkingRef.current = false
    }
  }, [])

  function zoomBy(factor: number) {
    const el = viewportRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const current = camRef.current
    const scale = Math.min(2.4, Math.max(0.35, current.scale * factor))
    const px = (rect.width - (openPlaceId ? 460 : 0)) / 2
    const py = rect.height / 2
    const wx = (px - current.x) / current.scale
    const wy = (py - current.y) / current.scale
    userMoved.current = true
    animateCam({ scale, x: px - wx * scale, y: py - wy * scale }, 240)
  }

  function focusPlace(placeId: string) {
    const el = viewportRef.current
    if (!el) return
    const point = heroPoint(siteFor(placeId, kingdoms))
    userMoved.current = true
    setLensOpen(false)
    setLensFocus(placeId)
    animateCam(framePoints(point, point, el.getBoundingClientRect(), openPlaceId ? 460 : 0, 1.6), 480)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as Element
    if (target.closest?.('[data-place]')) return
    userMoved.current = true
    drag.current = { x: event.clientX, y: event.clientY, cx: camRef.current.x, cy: camRef.current.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    const next = {
      ...camRef.current,
      x: drag.current.cx + (event.clientX - drag.current.x),
      y: drag.current.cy + (event.clientY - drag.current.y),
    }
    camRef.current = next
    setCam(next)
  }

  function onPointerUp() {
    drag.current = null
  }

  const homePoint = heroPoint(HOME)
  const ordered = [...kingdoms].sort((a, b) => a.y - b.y)
  const stats = taskStats(kingdoms)
  const allDone = stats.total > 0 && stats.done === stats.total
  const discovering = kingdoms.some((kingdom) => !kingdom.seen)

  return (
    <div className="absolute inset-0">
      <div
        ref={viewportRef}
        aria-label={`${APP_NAME} world map`}
        className="map-viewport absolute inset-3 overflow-hidden border-[5px] border-ink shadow-[0_8px_0_rgba(58,39,20,0.15)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          style={{
            width: MAP.width,
            height: MAP.height,
            transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
            transformOrigin: '0 0',
          }}
        >
          <svg width={MAP.width} height={MAP.height} viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="block">
            <g opacity={spotlight ? 0.9 : 1} pointerEvents="none">
              <Terrain />
            </g>
            <g pointerEvents="none">
              {kingdoms.map((kingdom) => {
                const d = roadD(homePoint, heroPoint(kingdom), kingdom.bend)
                const quiet = Boolean(spotlight && spotlight !== kingdom.id)
                return (
                  <g key={kingdom.id} opacity={quiet ? 0.28 : 1}>
                    <path
                      className={kingdom.seen ? undefined : 'road-rise'}
                      d={d}
                      fill="none"
                      stroke="#6b4423"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path d={d} fill="none" stroke="#e6d3a4" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                )
              })}
              {activePath && activePath.length > 1 && (
                <path className="route-walk" d={pointsToPath(activePath)} fill="none" stroke="#7a3142" strokeWidth="5" strokeLinecap="round" />
              )}
            </g>
            {ordered.map((kingdom) => {
              const progress = kingdomYield(kingdom)
              return (
                <MapPin
                  key={kingdom.id}
                  id={kingdom.id}
                  name={kingdom.generatedName}
                  x={kingdom.x}
                  y={kingdom.y}
                  label={kingdom.label}
                  status={kingdomStatus(kingdom)}
                  art={<KingdomArt motif={kingdom.motif} tint={kingdom.tint} flourished={progress.total > 0 && progress.done / progress.total >= 0.5} />}
                  rising={!kingdom.seen}
                  dimmed={Boolean(spotlight && spotlight !== kingdom.id)}
                  focused={spotlight === kingdom.id}
                  detail={progress.total === 0 ? 'Quests unwritten' : `${progress.done} of ${progress.total} quests`}
                  preview={kingdom.originalIdea}
                  onSelect={walkTo}
                />
              )
            })}
            <MapPin
              id={HOME.id}
              name={HOME.name}
              x={HOME.x}
              y={HOME.y}
              label="above"
              status="empty"
              art={<HomeArt />}
              dimmed={Boolean(spotlight && spotlight !== HOME.id)}
              focused={spotlight === HOME.id}
              onSelect={walkTo}
            />
            <HeroFigure x={hero.x} y={hero.y} walking={walking} face={face} notice={discovering && !walking} celebrating={celebrating && !walking} />
          </svg>
        </div>
      </div>

      <p className="pointer-events-none absolute left-6 top-6 z-10 max-w-sm bg-parchment/95 px-3 py-1 font-manuscript text-base text-ink shadow-sm">
        {walking
          ? 'On the path…'
          : kingdoms.length === 0
            ? 'Homebase stands alone. Chart an idea, and a road will appear.'
            : 'Choose a land. Drag to pan, scroll to look closer.'}
      </p>

      {game.herald && (
        <p className="herald pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 bg-parchment px-4 py-2 font-manuscript text-xl italic text-ink shadow-sm">
          {game.herald}
        </p>
      )}

      {allDone && !openPlaceId && !walking && (
        <div className="panel absolute right-6 top-6 z-10 max-w-xs p-3">
          <p className="font-manuscript text-lg leading-snug">The map is quiet. Your coins can furnish the hall.</p>
          <button type="button" className="ink-button mt-2" onClick={() => setView('homebase')}>
            Return to homebase
          </button>
        </div>
      )}

      <div className="absolute bottom-6 left-6 z-20">
        {lensOpen && (
          <div className="panel mb-2 w-72 p-3">
            <p className="font-display text-xs tracking-[0.18em]">SURVEY LENS</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button type="button" className="ink-button" onClick={() => zoomBy(1.18)}>
                Closer
              </button>
              <button type="button" className="ink-button" onClick={() => zoomBy(1 / 1.18)}>
                Farther
              </button>
              <button type="button" className="ink-button" onClick={fitRealm}>
                Whole realm
              </button>
            </div>
            <ul className="mt-3 max-h-48 space-y-1 overflow-auto">
              <li>
                <button
                  type="button"
                  className="w-full text-left font-manuscript text-lg leading-tight text-ink hover:text-burgundy"
                  onClick={() => focusPlace(HOME.id)}
                >
                  {HOME.name}
                </button>
              </li>
              {kingdoms.map((kingdom) => (
                <li key={kingdom.id}>
                  <button
                    type="button"
                    className="w-full text-left font-manuscript text-lg leading-tight text-ink hover:text-burgundy"
                    onClick={() => focusPlace(kingdom.id)}
                  >
                    {kingdom.generatedName}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-snug text-ink-soft">The lens draws you toward a land. The road is how you arrive.</p>
          </div>
        )}
        <button
          type="button"
          className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-wood-dark bg-gold-lite shadow-[0_3px_0_#3e2716]"
          aria-expanded={lensOpen}
          aria-label="Survey lens"
          onClick={() => setLensOpen((open) => !open)}
        >
          <Magnifier />
        </button>
      </div>
    </div>
  )
}

function Magnifier() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="12" cy="12" r="7" fill="#f6edd8" stroke="#3a2714" strokeWidth="2" />
      <path d="M17 17 L24 24" stroke="#3a2714" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
