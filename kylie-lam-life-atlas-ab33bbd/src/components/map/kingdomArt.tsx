/**
 * Drawings for lands the player discovered.
 * Each motif is centered on (0, 0), with the ground near the bottom.
 * `tint` shifts banners and roofs so two mills are not copies.
 */

import type { Motif } from '../../game/types.ts'

const INK = '#3a2714'
const BANNERS = ['#7a3142', '#3e5c45', '#3a4f6b', '#6b4423', '#8a6230']
const ROOFS = ['#c4a15a', '#8d5a3c', '#6d7c86', '#5c7348', '#a6844a']

function Ground({ wide = 40 }: { wide?: number }) {
  return <ellipse cx="2" cy="30" rx={wide} ry="9" fill="rgba(48,32,16,0.2)" />
}

function Hearth() {
  return (
    <g>
      <Ground wide={56} />
      <path d="M-52 28 Q-40 18 -28 26 T-8 24 T14 26 T36 22 T54 28" fill="#c4a15a" opacity="0.55" />
      <path d="M-48 26 L-42 6 L44 4 L50 26 Z" fill="#e7d3a8" stroke={INK} strokeWidth="1.4" />
      <path d="M-40 14 H-28 M-20 10 H36 M-36 20 H40" stroke="#cbb98a" strokeWidth="0.7" />
      <path d="M-20 26 L-16 -4 L18 -6 L22 26 Z" fill="#6e6258" stroke={INK} />
      <path d="M-22 -4 Q0 -32 22 -6" fill="#4a4038" stroke={INK} />
      <path d="M-14 -2 Q0 -18 14 -4" fill="none" stroke="#2c241c" strokeWidth="1.2" />
      <path d="M-8 26 L-6 8 Q0 2 6 8 L8 26" fill="#2c241c" stroke={INK} />
      <path d="M-2 10 C-6 2 -2 -6 2 -10 C4 -4 8 0 4 8 Z" fill="#e07a3a" />
      <path d="M0 8 C2 2 6 2 4 10" fill="#f0c56a" />
      <rect x="-34" y="2" width="10" height="8" fill="#f0c56a" stroke={INK} />
      <path d="M-34 6 H-24 M-29 2 V10" stroke={INK} strokeWidth="0.7" />
      <rect x="26" y="-18" width="7" height="24" fill="#5c4632" stroke={INK} />
      <circle className="smoke" cx="30" cy="-26" r="4" fill="#8d8680" />
      <circle className="smoke" cx="36" cy="-36" r="3" fill="#a39c96" />
      <g transform="translate(-46 14)">
        <path d="M0 10 Q8 -12 16 10" fill="#c4a15a" stroke={INK} />
        <path d="M4 10 Q8 -4 14 10" fill="#e6c56a" stroke={INK} />
        <path d="M18 10 Q24 -8 30 10" fill="#b8923a" stroke={INK} />
      </g>
      <ellipse cx="40" cy="18" rx="7" ry="4" fill="#e7d3a8" stroke={INK} />
      <path d="M34 16 Q40 12 46 16" fill="none" stroke="#8d5a3c" strokeWidth="1.2" />
    </g>
  )
}

function Clockwork({ tint }: { tint: number }) {
  const roof = ROOFS[tint]
  return (
    <g>
      <Ground wide={56} />
      <path d="M-30 26 L-26 -16 L26 -18 L30 26 Z" fill="#efe6d2" stroke={INK} strokeWidth="1.5" />
      <path d="M-38 -14 L0 -50 L38 -16 L26 -16 L-26 -14 Z" fill={roof} stroke={INK} />
      <path d="M-18 -8 H-6 V4 H-18 Z" fill="#f0c56a" stroke={INK} />
      <path d="M-18 -2 H-6 M-12 -8 V4" stroke={INK} strokeWidth="0.6" />
      <rect x="-7" y="6" width="14" height="20" fill="#3a2714" />
      <g transform="translate(2 -6)">
        <circle r="15" fill="#e6c56a" stroke={INK} strokeWidth="1.4" />
        <circle r="9" fill="none" stroke={INK} strokeWidth="0.7" />
        <circle r="3.4" fill={INK} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect key={angle} x="-1.6" y="-22" width="3.2" height="7" fill="#8d6a32" stroke={INK} strokeWidth="0.5" transform={`rotate(${angle})`} />
        ))}
      </g>
      <g transform="translate(34 2)">
        <circle r="9" fill="#c4a15a" stroke={INK} />
        <circle r="2" fill={INK} />
        <path d="M0 -11 V-7 M0 7 V11 M-11 0 H-7 M7 0 H11" stroke={INK} strokeWidth="1.2" />
      </g>
      <g transform="translate(-40 8)">
        <rect x="0" y="0" width="10" height="14" fill="#7a3142" stroke={INK} />
        <rect x="11" y="3" width="8" height="11" fill="#3a4f6b" stroke={INK} />
        <path d="M2 3 H8 M2 6 H8" stroke="#f6edd8" strokeWidth="0.6" />
      </g>
      <path d="M0 -50 V-58" stroke={INK} strokeWidth="1.2" />
      <path d="M0 -58 L8 -52 L0 -54 Z" fill="#7a3142" stroke={INK} />
    </g>
  )
}

function Bard({ tint }: { tint: number }) {
  return (
    <g>
      <Ground wide={58} />
      <circle cx="-48" cy="8" r="14" fill="#314a39" stroke={INK} />
      <circle cx="50" cy="10" r="16" fill="#3e5a46" stroke={INK} />
      <rect x="-50" y="8" width="4" height="16" fill="#5c3d28" />
      <rect x="48" y="10" width="4" height="16" fill="#5c3d28" />
      <path d="M-40 24 L-36 -6 L36 -8 L40 24 Z" fill="#f0e2c4" stroke={INK} strokeWidth="1.5" />
      <path d="M-32 8 V-4 M-16 10 V-6 M16 8 V-6 M28 10 V-4" stroke="#8d6a3a" strokeWidth="1.4" />
      <path d="M-46 -4 L0 -38 L46 -6 L36 -6 L-36 -4 Z" fill={ROOFS[tint]} stroke={INK} />
      <path d="M-8 24 V4 H8 V24" fill="#4a2e1c" stroke={INK} />
      <path d="M-24 -2 H-10 V12 H-24 Z" fill="#f0c56a" stroke={INK} />
      <path d="M-24 5 H-10 M-17 -2 V12" stroke={INK} strokeWidth="0.7" />
      <g transform="translate(24 0) rotate(-16)">
        <ellipse cx="0" cy="8" rx="9" ry="11" fill="#c4a15a" stroke={INK} />
        <ellipse cx="0" cy="8" rx="4" ry="6" fill="#6b4423" />
        <path d="M0 -10 V18" stroke={INK} />
        <path d="M-7 2 H7 M-6 8 H6" stroke={INK} strokeWidth="0.8" />
        <circle cx="0" cy="-12" r="2.2" fill={INK} />
      </g>
      <path d="M-8 -22 Q0 -28 8 -20" fill="none" stroke={INK} strokeWidth="0.7" />
      <circle cx="-4" cy="-24" r="1.1" fill={INK} />
      <circle cx="2" cy="-26" r="1.1" fill={INK} />
      <path d={`M-32 -30 L-18 -8 L-32 -6 Z`} fill={BANNERS[tint]} stroke={INK} />
    </g>
  )
}

function Road({ tint }: { tint: number }) {
  return (
    <g>
      <Ground wide={54} />
      <path d="M-36 26 Q-36 -8 0 -28 Q36 -8 36 26" fill="none" stroke={INK} strokeWidth="3" />
      <path d="M-28 26 Q-20 4 0 -8 Q20 4 28 26" fill="#e7d3a8" stroke={INK} />
      <path d="M-8 26 V8 H8 V26" fill="#6b4423" stroke={INK} />
      <path d="M-46 6 H-30" stroke="#c4b48a" strokeWidth="6" />
      <path d="M30 8 H48" stroke="#c4b48a" strokeWidth="6" />
      <path d={`M-34 -6 L-16 6 L-34 8 Z`} fill={BANNERS[tint]} stroke={INK} />
      <path d={`M34 -4 L16 8 L34 10 Z`} fill={BANNERS[(tint + 2) % 5]} stroke={INK} />
      <circle cx="0" cy="-30" r="4" fill="#e6c56a" stroke={INK} />
    </g>
  )
}

function Shrine({ tint }: { tint: number }) {
  return (
    <g>
      <Ground wide={46} />
      <path d="M-34 26 L-30 -2 L30 -4 L34 26 Z" fill="#efe2c8" stroke={INK} strokeWidth="1.5" />
      <path d="M-38 0 Q0 -46 38 -2" fill="none" stroke={INK} strokeWidth="2.4" />
      <path d="M-22 26 V2 H22 V26" fill="#f6edd8" stroke={INK} />
      <path d="M-6 26 V10 H6 V26" fill="#4a2e1c" />
      <circle cx="-24" cy="-8" r="4" fill="#e6c56a" stroke={INK} />
      <circle cx="24" cy="-8" r="4" fill="#e6c56a" stroke={INK} />
      <path d={`M0 -36 L6 -22 H-6 Z`} fill={BANNERS[tint]} stroke={INK} />
      <path d="M-6 8 H6" stroke={INK} />
      <circle cx="0" cy="2" r="3" fill="#e6c56a" stroke={INK} />
    </g>
  )
}

function Keep({ tint }: { tint: number }) {
  return (
    <g>
      <Ground wide={48} />
      <path d="M-24 26 L-20 -36 L20 -38 L24 26 Z" fill="#e4d5b4" stroke={INK} strokeWidth="1.5" />
      <path d="M-18 8 H-6 M6 4 H16 M-16 -8 H-4" stroke="#cbb98a" strokeWidth="0.8" />
      <path d="M-28 -34 H28 V-42 H20 V-52 H8 V-42 H-8 V-52 H-20 V-42 H-28 Z" fill={ROOFS[tint]} stroke={INK} />
      <rect x="-6" y="6" width="12" height="20" fill="#3a2714" />
      <rect x="-14" y="-18" width="9" height="12" fill="#f0c56a" stroke={INK} />
      <rect x="6" y="-20" width="9" height="12" fill="#f6edd8" stroke={INK} />
      <path d="M8 -16 H13" stroke="#e07a3a" strokeWidth="1.4" />
      <path d="M16 -6 L30 4 L18 6 Z" fill={BANNERS[tint]} stroke={INK} />
      <g transform="translate(-36 6)">
        <rect x="0" y="4" width="12" height="16" fill="#7a3142" stroke={INK} />
        <rect x="3" y="0" width="10" height="14" fill="#3a4f6b" stroke={INK} />
        <path d="M5 4 H11 M5 7 H11" stroke="#f6edd8" strokeWidth="0.5" />
      </g>
      <path d="M24 -22 Q30 -32 22 -36" fill="none" stroke={INK} strokeWidth="1.1" />
      <path d="M22 -36 L30 -32 L20 -30 Z" fill="#f6edd8" stroke={INK} />
    </g>
  )
}

function Lens() {
  return (
    <g>
      <Ground wide={52} />
      <path d="M-46 22 Q-20 8 0 18 T40 14 T58 22" fill="#8d9a6a" opacity="0.7" />
      <path d="M-22 26 L-18 -6 L18 -8 L22 26 Z" fill="#efe6d2" stroke={INK} strokeWidth="1.5" />
      <path d="M-30 -4 Q0 -42 30 -6 Q0 -16 -30 -4 Z" fill="#6d8490" stroke={INK} strokeWidth="1.6" />
      <path d="M-12 -14 Q0 -28 12 -14" fill="none" stroke="#f6edd8" strokeWidth="1.5" />
      <path d="M-4 -22 H4" stroke="#f0c56a" strokeWidth="1.4" />
      <rect x="-5" y="6" width="10" height="20" fill="#4a2e1c" />
      <g transform="translate(30 2) rotate(18)">
        <rect x="-3" y="-16" width="6" height="28" fill="#5c4632" stroke={INK} />
        <circle cy="-16" r="8" fill="#d5e0e2" stroke={INK} />
        <circle cy="-16" r="3.2" fill="#3a4f6b" stroke={INK} />
        <path d="M-6 -16 H6" stroke={INK} strokeWidth="0.6" />
      </g>
      <path d="M22 18 H40" stroke={INK} strokeWidth="1.6" />
      <path d="M26 18 V26 M36 18 V26" stroke={INK} />
    </g>
  )
}

function Grove() {
  return (
    <g>
      <Ground wide={50} />
      <path d="M-30 24 L-26 4 L26 2 L30 24 Z" fill="#efe6d2" stroke={INK} />
      <path d="M-34 4 L0 -16 L34 2 L26 4 L-26 4 Z" fill="#c9ddd4" stroke={INK} strokeWidth="1.4" />
      <path d="M-16 4 V-6 H16 V2" fill="none" stroke="#7e99a3" strokeWidth="1.2" />
      <circle cx="-38" cy="6" r="12" fill="#3e5a46" stroke={INK} />
      <circle cx="40" cy="8" r="14" fill="#314a39" stroke={INK} />
      <rect x="-4" y="8" width="8" height="16" fill="#5c3d28" />
      <circle cx="0" cy="2" r="7" fill="#5f7348" stroke={INK} />
      <path d="M-8 22 H8" stroke="#6b8f4e" strokeWidth="2" />
    </g>
  )
}

function Library({ tint }: { tint: number }) {
  return (
    <g>
      <Ground wide={50} />
      <path d="M-42 26 L-38 -8 L38 -10 L42 26 Z" fill="#f3e6c8" stroke={INK} strokeWidth="1.5" />
      <path d="M-46 -6 L0 -32 L46 -8" fill="none" stroke={INK} strokeWidth="2" />
      <path d="M-8 26 V2 H10 V26" fill="#4a2e1c" stroke={INK} />
      {[-28, -16, 16, 26].map((x) => (
        <g key={x} transform={`translate(${x} 6)`}>
          <rect x="-4" y="-16" width="8" height="22" fill={x < 0 ? ROOFS[tint] : BANNERS[tint]} stroke={INK} />
        </g>
      ))}
      <path d="M-4 -20 H6 V-14 H-4 Z" fill="#e6c56a" stroke={INK} />
    </g>
  )
}

function Spire() {
  return (
    <g>
      <Ground wide={36} />
      <path d="M-16 26 L-12 -20 L12 -22 L16 26 Z" fill="#e7dcc4" stroke={INK} strokeWidth="1.5" />
      <path d="M-18 -20 L0 -58 L18 -22 Z" fill="#6d7c86" stroke={INK} />
      <rect x="-4" y="8" width="8" height="18" fill="#3a2714" />
      <rect x="-8" y="-8" width="6" height="8" fill="#d5e0e2" stroke={INK} />
      <rect x="3" y="-12" width="6" height="8" fill="#d5e0e2" stroke={INK} />
      <circle cx="0" cy="-36" r="3" fill="#e6c56a" stroke={INK} />
    </g>
  )
}

function Stage({ tint }: { tint: number }) {
  return (
    <g>
      <Ground wide={52} />
      <path d="M-40 26 L-36 8 L36 6 L40 26 Z" fill="#c4b48a" stroke={INK} />
      <path d="M-38 8 V-16 H38 V6" fill="#f6edd8" stroke={INK} />
      <path d="M-38 -16 Q0 -36 38 -16" fill={BANNERS[tint]} stroke={INK} />
      <path d="M-30 8 V-8 Q-16 0 -8 8" fill={ROOFS[tint]} stroke={INK} />
      <path d="M30 6 V-8 Q16 0 8 6" fill={ROOFS[(tint + 1) % 5]} stroke={INK} />
      <circle cx="0" cy="-6" r="5" fill="#e6c56a" stroke={INK} />
    </g>
  )
}

function Atelier() {
  return (
    <g>
      <Ground wide={46} />
      <path d="M-24 24 L-20 -4 L18 -6 L22 24 Z" fill="#f0e2c4" stroke={INK} />
      <path d="M-30 -2 L0 -28 L28 -4 Z" fill="#8d5a3c" stroke={INK} />
      <path d="M18 22 L36 -8 L44 22 Z" fill="#efe6d2" stroke={INK} />
      <path d="M22 10 H40" stroke="#7a3142" strokeWidth="2" />
      <path d="M28 4 L34 16" stroke={INK} />
      <rect x="-6" y="6" width="10" height="18" fill="#4a2e1c" />
    </g>
  )
}

function Mill({ tint }: { tint: number }) {
  return (
    <g>
      <Ground wide={48} />
      <path d="M-16 26 L-12 -18 L22 -20 L26 26 Z" fill="#e7dcc4" stroke={INK} strokeWidth="1.5" />
      <path d="M-22 -16 L4 -40 L30 -18 Z" fill={ROOFS[tint]} stroke={INK} />
      <circle cx="-24" cy="4" r="14" fill="#c4b48a" stroke={INK} />
      <path d="M-24 4 L-24 -16 M-24 4 L-8 4 M-24 4 L-24 20 M-24 4 L-40 4" stroke={INK} strokeWidth="2" />
      <rect x="2" y="6" width="10" height="20" fill="#4a2e1c" />
      <path d={`M16 -28 L28 -16 L16 -14 Z`} fill={BANNERS[tint]} stroke={INK} />
    </g>
  )
}

function Water() {
  return (
    <g>
      <ellipse cx="8" cy="36" rx="72" ry="16" fill="#5f8494" />
      <ellipse cx="8" cy="33" rx="56" ry="9" fill="#8eafbc" />
      <path d="M-52 32 Q-16 22 12 32 T66 28" fill="none" stroke="#e7f2f4" strokeWidth="1.2" opacity="0.85" />
      <path d="M-40 40 Q-4 30 20 40 T60 36" fill="none" stroke="#4f6e7c" strokeWidth="1.3" />
      <path d="M-58 26 Q-52 10 -48 26 M-50 28 Q-44 8 -40 28" fill="none" stroke="#3e5c45" strokeWidth="1.3" />
      <path d="M-16 30 L-12 0 H30 L34 30 Z" fill="#efe6d2" stroke={INK} strokeWidth="1.4" />
      <path d="M-8 10 H0 V18 H-8 Z M12 8 H20 V16 H12 Z" fill="#f0c56a" stroke={INK} />
      <path d="M-24 2 L8 -30 L42 0 L30 2 L-12 0 Z" fill="#6d7c86" stroke={INK} />
      <path d="M-16 2 L8 -20 L32 0" fill="none" stroke="#9aadb4" strokeWidth="1" />
      <rect x="22" y="-20" width="6" height="14" fill="#5c4632" stroke={INK} />
      <path d="M4 30 V12 H16 V30" fill="#4a2e1c" stroke={INK} />
      <path d="M-40 30 L-34 14 H-14 L-8 30" fill="#6b4423" stroke={INK} />
      <path d="M-34 14 V8 M-16 14 V8" stroke={INK} />
      <path d="M18 30 L24 14 H42 L48 30" fill="#6b4423" stroke={INK} />
      <path d="M38 36 Q50 28 62 36 L56 38 Q48 32 42 38 Z" fill="#e7dcc4" stroke={INK} />
      <path d="M-22 -2 L-10 -10 L-22 -6 Z" fill="#7a3142" stroke={INK} />
      <path d="M-22 -2 V14" stroke={INK} strokeWidth="1.2" />
      <circle cx="52" cy="12" r="3.2" fill="#e6c56a" stroke={INK} />
      <path d="M52 15 V24" stroke={INK} />
    </g>
  )
}

function Flourish({ tint }: { tint: number }) {
  return (
    <g className="land-flourish">
      <path d="M-46 -6 L-34 8 L-46 10 Z" fill={BANNERS[tint]} stroke={INK} />
      <path d="M-40 10 V26" stroke={INK} strokeWidth="1.4" />
      <circle cx="36" cy="-8" r="3" fill="#e6c56a" stroke={INK} />
      <circle cx="28" cy="4" r="2" fill="#f6edd8" opacity="0.9" />
    </g>
  )
}

export function KingdomArt({ motif, tint, flourished = false }: { motif: Motif; tint: number; flourished?: boolean }) {
  const safe = ((tint % 5) + 5) % 5
  let art = <Mill tint={safe} />
  switch (motif) {
    case 'hearth':
      art = <Hearth />
      break
    case 'clockwork':
      art = <Clockwork tint={safe} />
      break
    case 'bard':
      art = <Bard tint={safe} />
      break
    case 'road':
      art = <Road tint={safe} />
      break
    case 'shrine':
      art = <Shrine tint={safe} />
      break
    case 'keep':
      art = <Keep tint={safe} />
      break
    case 'lens':
      art = <Lens />
      break
    case 'grove':
      art = <Grove />
      break
    case 'library':
      art = <Library tint={safe} />
      break
    case 'spire':
      art = <Spire />
      break
    case 'stage':
      art = <Stage tint={safe} />
      break
    case 'atelier':
      art = <Atelier />
      break
    case 'water':
      art = <Water />
      break
    case 'mill':
      art = <Mill tint={safe} />
      break
  }
  return (
    <g>
      {art}
      {flourished && <Flourish tint={safe} />}
    </g>
  )
}
