/**
 * Map geometry: roads, camera framing, and where the hero stands.
 * Coordinates match the SVG viewBox in `MAP`.
 */

import { MAP } from '../config/world.ts'

export type Point = { x: number; y: number }

export type Camera = { x: number; y: number; scale: number }

export type Site = {
  x: number
  y: number
  heroDx: number
  heroDy: number
  bend: number
}

export function heroPoint(site: Site): Point {
  return { x: site.x + site.heroDx, y: site.y + site.heroDy }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export function quadControl(from: Point, to: Point, bend: number): Point {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  return { x: mx + (-dy / len) * bend, y: my + (dx / len) * bend }
}

export function sampleQuad(from: Point, to: Point, bend: number, steps = 28): Point[] {
  const control = quadControl(from, to, bend)
  const points: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    points.push({
      x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
      y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
    })
  }
  return points
}

export function roadD(from: Point, to: Point, bend: number): string {
  const control = quadControl(from, to, bend)
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
}

/**
 * Walk the painted roads: out from home, back home, or home-then-out.
 * `bend` belongs to the kingdom at the far end of that road.
 */
export function routeBetween(origin: Site, dest: Site, home: Site): Point[] {
  const from = heroPoint(origin)
  const to = heroPoint(dest)
  const homePoint = heroPoint(home)
  if (Math.hypot(to.x - from.x, to.y - from.y) < 2) return [to]
  const originIsHome = Math.hypot(from.x - homePoint.x, from.y - homePoint.y) < 2
  const destIsHome = Math.hypot(to.x - homePoint.x, to.y - homePoint.y) < 2
  if (originIsHome) return sampleQuad(from, to, dest.bend)
  if (destIsHome) return [...sampleQuad(homePoint, from, origin.bend)].reverse()
  const back = sampleQuad(homePoint, from, origin.bend)
  const out = sampleQuad(homePoint, to, dest.bend)
  return [...back].reverse().concat(out.slice(1))
}

export function polylineLength(points: Point[]): number {
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y)
  }
  return total
}

export function positionAlong(points: Point[], t: number): { point: Point; face: 1 | -1 } {
  if (points.length === 0) return { point: { x: 0, y: 0 }, face: 1 }
  if (points.length === 1) return { point: points[0], face: 1 }

  const lengths: number[] = []
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y)
    lengths.push(len)
    total += len
  }

  let remaining = total * clamp(t, 0, 1)
  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i]
    if (remaining <= len || i === lengths.length - 1) {
      const fraction = len === 0 ? 0 : remaining / len
      const a = points[i]
      const b = points[i + 1]
      return {
        point: { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction },
        face: b.x - a.x >= 0 ? 1 : -1,
      }
    }
    remaining -= len
  }

  return { point: points[points.length - 1], face: 1 }
}

export function cameraFit(rect: { width: number; height: number }): Camera {
  const margin = 12
  const scale = Math.min((rect.width - margin * 2) / MAP.width, (rect.height - margin * 2) / MAP.height)
  return {
    scale,
    x: (rect.width - MAP.width * scale) / 2,
    y: (rect.height - MAP.height * scale) / 2,
  }
}

/**
 * Frame one or two world points inside the viewport.
 * `panelWidth` leaves room for the quest scroll on the right.
 */
export function framePoints(
  a: Point,
  b: Point,
  rect: { width: number; height: number },
  panelWidth: number,
  maxScale = 1.45,
): Camera {
  const minX = Math.min(a.x, b.x) - 180
  const maxX = Math.max(a.x, b.x) + 180
  const minY = Math.min(a.y, b.y) - 200
  const maxY = Math.max(a.y, b.y) + 120
  const viewW = Math.max(240, rect.width - panelWidth)
  const viewH = Math.max(240, rect.height)
  const scale = clamp(Math.min(viewW / (maxX - minX), viewH / (maxY - minY)), 0.42, maxScale)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return {
    scale,
    x: viewW / 2 - cx * scale,
    y: viewH / 2 - cy * scale,
  }
}
