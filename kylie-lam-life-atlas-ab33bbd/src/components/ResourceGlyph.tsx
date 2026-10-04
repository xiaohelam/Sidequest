import type { Motif, ResourceKind } from '../game/types.ts'

const INK = '#3a2714'

/** A small ink drawing for a guide, chosen from the words in its title. */
export function ResourceGlyph({
  title,
  kind,
  motif,
}: {
  title: string
  kind: ResourceKind
  motif?: Motif
}) {
  const picture = pictureFor(`${title} ${kind} ${motif ?? ''}`)
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0" aria-hidden="true">
      <rect x="1.5" y="1.5" width="45" height="45" rx="3" fill="#f6edd8" stroke={INK} strokeWidth="1.4" />
      <rect x="4" y="4" width="40" height="40" fill="none" stroke="#c4a15a" strokeWidth="0.6" />
      {picture}
    </svg>
  )
}

function pictureFor(text: string) {
  const hay = text.toLowerCase()
  if (/sourdough|bread|loaf|bak|yeast|flour|starter/.test(hay)) return <Loaf />
  if (/swim|breath|freestyle|water|stroke/.test(hay)) return <Wave />
  if (/rail|train|shinkansen|station/.test(hay)) return <Train />
  if (/flight|airport|airline|fly/.test(hay)) return <Wing />
  if (/python|code|loop|program/.test(hay)) return <Gear />
  if (/guitar|chord|music/.test(hay)) return <Lute />
  if (/philosoph|encyclopedia|scholar/.test(hay)) return <Book />
  if (/run|5k|jog|mile/.test(hay)) return <Road />
  if (/map|kyoto|japan|travel|region/.test(hay)) return <MapSheet />
  if (/hotel|stay|lodg|neighborhood/.test(hay)) return <Inn />
  if (hay.includes('watch')) return <PlayScroll />
  if (hay.includes('checklist') || hay.includes('get')) return <List />
  if (hay.includes('tool')) return <Hammer />
  if (hay.includes('go')) return <Compass />
  if (hay.includes('explore')) return <MapSheet />
  if (hay.includes('inspire')) return <Star />
  return <Scroll />
}

/** A wax-seal sized mark for a kingdom, matching its map motif. */
export function KingdomSeal({ motif }: { motif: Motif }) {
  const picture =
    motif === 'hearth' ? <Loaf /> :
    motif === 'water' ? <Wave /> :
    motif === 'clockwork' ? <Gear /> :
    motif === 'bard' ? <Lute /> :
    motif === 'road' ? <Road /> :
    motif === 'keep' || motif === 'library' || motif === 'spire' ? <Book /> :
    motif === 'lens' ? <Star /> :
    motif === 'grove' ? <Leaf /> :
    <MapSheet />
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#7a3142" />
      <circle cx="24" cy="24" r="18" fill="#f6edd8" stroke="#e6c56a" strokeWidth="1.2" />
      <g transform="translate(9 9) scale(0.62)">{picture}</g>
    </svg>
  )
}

function Loaf() {
  return (
    <g>
      <path d="M10 30 Q24 12 38 30 V34 H10 Z" fill="#e7d3a8" stroke={INK} />
      <path d="M16 30 Q24 20 32 30" fill="none" stroke="#8d5a3c" />
      <path d="M22 22 C20 16 26 12 24 8 C28 14 26 18 26 22" fill="#e07a3a" />
    </g>
  )
}

function Wave() {
  return (
    <g fill="none" stroke="#3a4f6b" strokeWidth="1.6">
      <path d="M8 20 Q14 14 20 20 T32 20 T40 20" />
      <path d="M8 27 Q14 21 20 27 T32 27 T40 27" />
      <path d="M8 34 Q14 28 20 34 T32 34" stroke={INK} />
    </g>
  )
}

function Train() {
  return (
    <g>
      <rect x="10" y="16" width="28" height="14" rx="2" fill="#f6edd8" stroke={INK} />
      <rect x="14" y="19" width="8" height="6" fill="#7e99a3" stroke={INK} />
      <rect x="26" y="19" width="8" height="6" fill="#7e99a3" stroke={INK} />
      <circle cx="16" cy="33" r="2.2" fill={INK} />
      <circle cx="32" cy="33" r="2.2" fill={INK} />
      <path d="M8 36 H40" stroke={INK} />
    </g>
  )
}

function Wing() {
  return (
    <g>
      <path d="M8 28 Q20 10 40 18 Q26 20 22 30 Z" fill="#d5e0e2" stroke={INK} />
      <path d="M14 26 Q24 18 36 20" fill="none" stroke={INK} />
    </g>
  )
}

function Gear() {
  return (
    <g>
      <circle cx="24" cy="24" r="7" fill="#e6c56a" stroke={INK} />
      <circle cx="24" cy="24" r="2.4" fill={INK} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect key={angle} x="22.2" y="8" width="3.6" height="6" fill="#8d6a32" stroke={INK} strokeWidth="0.6" transform={`rotate(${angle} 24 24)`} />
      ))}
    </g>
  )
}

function Lute() {
  return (
    <g>
      <ellipse cx="20" cy="28" rx="8" ry="10" fill="#c4a15a" stroke={INK} />
      <path d="M24 20 L34 8" stroke={INK} strokeWidth="1.6" />
      <circle cx="20" cy="28" r="2" fill={INK} />
    </g>
  )
}

function Book() {
  return (
    <g>
      <path d="M10 14 H24 V36 H10 Z" fill="#7a3142" stroke={INK} />
      <path d="M24 14 H38 V36 H24 Z" fill="#f6edd8" stroke={INK} />
      <path d="M28 20 H34 M28 24 H34" stroke={INK} strokeWidth="0.7" />
    </g>
  )
}

function Road() {
  return (
    <g>
      <path d="M16 36 Q18 20 24 12 Q30 20 32 36" fill="#e7d3a8" stroke={INK} />
      <path d="M24 16 V34" stroke={INK} strokeDasharray="2 2" />
    </g>
  )
}

function MapSheet() {
  return (
    <g>
      <path d="M10 14 L18 12 L30 16 L38 12 V34 L30 36 L18 32 L10 36 Z" fill="#efe6d2" stroke={INK} />
      <path d="M18 12 V32 M30 16 V36" stroke={INK} strokeWidth="0.7" />
      <circle cx="24" cy="24" r="2" fill="#7a3142" />
    </g>
  )
}

function Inn() {
  return (
    <g>
      <path d="M12 34 V20 L24 12 L36 20 V34 Z" fill="#e7d3a8" stroke={INK} />
      <rect x="20" y="24" width="8" height="10" fill="#4a2e1c" />
    </g>
  )
}

function PlayScroll() {
  return (
    <g>
      <path d="M12 16 H32 V34 H12 Z" fill="#f6edd8" stroke={INK} />
      <path d="M12 16 Q8 25 12 34 M32 16 Q38 25 32 34" fill="none" stroke={INK} />
      <path d="M20 21 L28 25 L20 29 Z" fill="#7a3142" />
    </g>
  )
}

function List() {
  return (
    <g>
      <path d="M14 12 H36 V36 H14 Z" fill="#f6edd8" stroke={INK} />
      <path d="M18 18 H32 M18 24 H32 M18 30 H28" stroke={INK} />
      <circle cx="16" cy="18" r="0" />
    </g>
  )
}

function Hammer() {
  return (
    <g>
      <rect x="14" y="14" width="16" height="8" fill="#8d6a32" stroke={INK} />
      <path d="M22 22 V36" stroke={INK} strokeWidth="2" />
    </g>
  )
}

function Compass() {
  return (
    <g>
      <circle cx="24" cy="24" r="12" fill="none" stroke={INK} />
      <path d="M24 12 L27 24 L24 36 L21 24 Z" fill="#7a3142" stroke={INK} />
    </g>
  )
}

function Scroll() {
  return (
    <g>
      <path d="M14 14 H34 V34 H14 Z" fill="#f6edd8" stroke={INK} />
      <path d="M14 14 Q8 24 14 34 M34 14 Q40 24 34 34" fill="none" stroke={INK} />
      <path d="M18 20 H30 M18 25 H30 M18 30 H26" stroke={INK} strokeWidth="0.8" />
    </g>
  )
}

function Star() {
  return <path d="M24 10 L27 20 H38 L29 26 L32 36 L24 30 L16 36 L19 26 L10 20 H21 Z" fill="#e6c56a" stroke={INK} />
}

function Leaf() {
  return <path d="M24 36 Q12 24 16 12 Q32 14 36 22 Q30 34 24 36" fill="#5f7348" stroke={INK} />
}
