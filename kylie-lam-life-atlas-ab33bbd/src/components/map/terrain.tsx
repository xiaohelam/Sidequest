/**
 * The illustrated world under the landmarks: sea, island, woods,
 * mountains, river, and the compass. It does not handle clicks.
 */

import { APP_NAME } from '../../config/app.ts'
import { MAP } from '../../config/world.ts'

const INK = '#3a2714'

const TREES: { x: number; y: number; s: number }[] = [
  { x: 250, y: 430, s: 0.85 },
  { x: 330, y: 470, s: 1 },
  { x: 230, y: 500, s: 0.75 },
  { x: 360, y: 600, s: 0.9 },
  { x: 250, y: 640, s: 1.05 },
  { x: 410, y: 640, s: 0.8 },
  { x: 540, y: 600, s: 0.7 },
  { x: 560, y: 760, s: 0.85 },
  { x: 820, y: 760, s: 0.9 },
  { x: 900, y: 720, s: 0.75 },
  { x: 640, y: 300, s: 0.55 },
  { x: 760, y: 290, s: 0.6 },
  { x: 500, y: 300, s: 0.65 },
  { x: 980, y: 500, s: 0.7 },
  { x: 1040, y: 460, s: 0.55 },
  { x: 200, y: 580, s: 0.8 },
]

function Tree({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="2" width="6" height="14" fill="#5c3d28" />
      <circle cx="0" cy="-6" r="12" fill="#3e5a46" stroke={INK} strokeWidth="0.8" />
      <circle cx="-8" cy="0" r="8" fill="#314a39" stroke={INK} strokeWidth="0.7" />
      <circle cx="8" cy="-1" r="9" fill="#4e6b52" stroke={INK} strokeWidth="0.7" />
    </g>
  )
}

function Mountain({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <path d={`M ${x} ${y} L ${x + w / 2} ${y - h} L ${x + w} ${y} Z`} fill="#8d8680" stroke={INK} strokeWidth="1.2" />
      <path
        d={`M ${x + w / 2} ${y - h} L ${x + w * 0.4} ${y - h * 0.62} L ${x + w * 0.62} ${y - h * 0.62} Z`}
        fill="#f4f0e6"
        stroke={INK}
        strokeWidth="0.6"
      />
    </g>
  )
}

function CompassRose() {
  return (
    <g transform="translate(130 390)">
      <circle r="48" fill="#f6edd8" stroke={INK} strokeWidth="2" />
      <circle r="36" fill="none" stroke={INK} strokeWidth="1" />
      <path d="M0 -30 L7 0 L0 30 L-7 0 Z" fill="#7a3142" stroke={INK} />
      <path d="M-22 0 L0 -6 L22 0 L0 6 Z" fill="#3a2714" />
      <circle r="3" fill="#e6c56a" stroke={INK} />
      <text y="-54" textAnchor="middle" fontFamily="Cinzel, Palatino, serif" fontSize="13" fill={INK}>
        N
      </text>
      <text y="64" textAnchor="middle" fontFamily="Cinzel, Palatino, serif" fontSize="11" fill={INK}>
        S
      </text>
      <text x="-58" y="4" textAnchor="middle" fontFamily="Cinzel, Palatino, serif" fontSize="11" fill={INK}>
        W
      </text>
      <text x="58" y="4" textAnchor="middle" fontFamily="Cinzel, Palatino, serif" fontSize="11" fill={INK}>
        E
      </text>
    </g>
  )
}

export function Terrain() {
  return (
    <g>
      <defs>
        <filter id="paper-grain" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="noise" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.18" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
      <rect width={MAP.width} height={MAP.height} fill="#7e99a3" />
      <path d="M40 120 Q90 100 140 124" fill="none" stroke="#6a8792" strokeWidth="2" />
      <path d="M60 220 Q120 200 170 226" fill="none" stroke="#6a8792" strokeWidth="2" />
      <path d="M80 760 Q140 740 190 768" fill="none" stroke="#6a8792" strokeWidth="2" />
      <path d="M1220 800 Q1280 780 1340 808" fill="none" stroke="#6a8792" strokeWidth="2" />
      <g transform="translate(120 250)">
        <path d="M0 12 Q20 24 42 12 L34 12 Q20 18 8 12 Z" fill="#6b4423" stroke={INK} />
        <path d="M20 12 V-14" stroke={INK} strokeWidth="1.4" />
        <path d="M20 -12 L36 -1 L20 2 Z" fill="#f3e6c8" stroke={INK} />
      </g>

      <path
        d="M150 500 C140 340 230 160 420 115 C600 72 800 78 980 120 C1160 162 1290 260 1310 420 C1330 580 1260 720 1100 785 C940 845 760 840 580 825 C400 808 230 740 175 640 C140 580 145 540 150 500 Z"
        fill="#cbb98a"
        stroke="#5c4a32"
        strokeWidth="2"
        filter="url(#paper-grain)"
      />
      <path
        d="M188 500 C180 360 265 185 450 145 C620 108 800 112 970 150 C1135 188 1255 280 1272 425 C1290 570 1225 700 1080 758 C930 812 760 808 590 794 C420 780 255 715 210 630 C180 575 182 535 188 500 Z"
        fill="#7d9160"
        stroke="#3e4f3a"
        strokeWidth="1.5"
      />

      <ellipse cx="480" cy="470" rx="90" ry="28" fill="#738556" opacity="0.85" />
      <ellipse cx="900" cy="600" rx="130" ry="36" fill="#6d8450" opacity="0.8" />
      <ellipse cx="760" cy="640" rx="80" ry="22" fill="#849664" opacity="0.7" />

      <Mountain x={470} y={300} w={150} h={130} />
      <Mountain x={560} y={290} w={170} h={160} />
      <Mountain x={680} y={300} w={140} h={120} />
      <Mountain x={760} y={310} w={120} h={100} />

      {TREES.map((tree) => (
        <Tree key={`${tree.x}-${tree.y}`} x={tree.x} y={tree.y} s={tree.s} />
      ))}

      <path
        d="M540 200 C500 280 560 340 520 420 C480 500 540 560 600 640 C660 720 740 760 800 840"
        fill="none"
        stroke="#5f8494"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M540 200 C500 280 560 340 520 420 C480 500 540 560 600 640 C660 720 740 760 800 840"
        fill="none"
        stroke="#8eafbc"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <ellipse cx="560" cy="390" rx="36" ry="18" fill="#6f92a0" stroke="#4f6e7c" />

      <g transform="translate(500 418)">
        <path d="M-18 6 H22 L18 14 H-14 Z" fill="#6b4423" stroke={INK} />
        <path d="M-16 6 V-2 M18 6 V-2" stroke={INK} strokeWidth="2" />
      </g>

      <g transform="translate(640 560)" fill="#7a3142" opacity="0.8">
        <circle cx="0" cy="0" r="2" />
        <circle cx="8" cy="4" r="1.6" />
        <circle cx="-6" cy="3" r="1.5" />
      </g>

      <g transform="translate(1180 360)">
        <rect x="-3" y="-20" width="6" height="36" fill="#6b4423" stroke={INK} />
        <path d="M0 -20 L16 -12 L0 -6 Z" fill="#7a3142" stroke={INK} />
        <path d="M-10 16 H10 L8 22 H-8 Z" fill="#8d8478" stroke={INK} />
      </g>
      <g transform="translate(300 560)">
        <path d="M-20 16 L-8 -8 L6 16 Z" fill="#e7d3a8" stroke={INK} />
        <path d="M4 16 L14 -14 L28 16 Z" fill="#efe6d2" stroke={INK} />
        <rect x="8" y="4" width="6" height="12" fill="#4a2e1c" />
        <circle cx="-2" cy="18" r="8" fill="#c4a15a" opacity="0.8" />
      </g>
      <g transform="translate(1020 700)" opacity="0.9">
        <path d="M0 10 Q20 -6 40 10" fill="none" stroke="#6b8f4e" strokeWidth="2" />
        <path d="M8 10 Q18 -8 28 10" fill="#e6c56a" opacity="0.7" />
        <path d="M-16 14 H56" stroke="#8d6a3a" strokeWidth="1.2" />
      </g>

      <CompassRose />

      <g transform="translate(250 250)" opacity="0.9">
        <path d="M0 20 L18 -8 L36 20" fill="none" stroke={INK} strokeWidth="1.4" />
        <path d="M8 20 V4 H28 V20" fill="#cfc3a4" stroke={INK} />
        <path d="M14 4 V-10 H22 V4" fill="#8d8680" stroke={INK} />
        <path d="M10 20 H26" stroke="#7a3142" strokeWidth="2" />
      </g>

      <g transform="translate(1080 250)">
        <path d="M0 40 L40 -30 L80 40 Z" fill="#9a9288" stroke={INK} strokeWidth="1.1" />
        <path d="M40 -30 L28 -2 L52 -2 Z" fill="#f4f0e6" stroke={INK} strokeWidth="0.6" />
        <path d="M20 40 L46 -8 L72 40 Z" fill="#7f7872" stroke={INK} strokeWidth="1" />
        <path d="M18 28 Q40 8 62 30" fill="none" stroke="#5c534c" strokeWidth="0.8" />
      </g>
      <g transform="translate(900 680)" opacity="0.85">
        <path d="M0 8 H70 M0 16 H70 M8 4 V20 M24 4 V20 M48 4 V20" stroke="#6b4423" strokeWidth="1.1" />
        <path d="M10 0 Q18 -10 26 0" fill="#c4a15a" stroke={INK} strokeWidth="0.5" />
        <path d="M40 2 Q48 -8 56 2" fill="#e6c56a" stroke={INK} strokeWidth="0.5" />
      </g>

      <g transform="translate(980 430)">
        <path d="M-20 16 H24" stroke="#6b4423" strokeWidth="3" />
        <path d="M-8 16 V-18" stroke={INK} strokeWidth="2" />
        <path d="M-8 -16 L12 -4 L-8 -2 Z" fill="#7a3142" stroke={INK} />
      </g>

      <g transform="translate(360 690)" opacity="0.85">
        <path d="M0 0 Q8 -14 16 0 Q24 -12 32 0" fill="#c4a15a" stroke={INK} strokeWidth="0.6" />
        <path d="M4 2 Q12 -10 20 2" fill="#e6c56a" />
      </g>

      <g transform="translate(1120 640)" opacity="0.55">
        <ellipse cx="0" cy="0" rx="70" ry="16" fill="#f6edd8" />
        <ellipse cx="30" cy="8" rx="40" ry="10" fill="#efe6d2" />
      </g>

      <g transform="translate(700 852)">
        <rect x="-168" y="-24" width="336" height="44" fill="#f6edd8" stroke={INK} strokeWidth="1.6" />
        <text
          y="-4"
          textAnchor="middle"
          fontFamily="Cinzel, Palatino, serif"
          fontSize="10"
          letterSpacing="0.22em"
          fill={INK}
        >
          THE REALM OF
        </text>
        <text y="16" textAnchor="middle" fontFamily="Cinzel, Palatino, serif" fontSize="16" fill={INK}>
          {APP_NAME.toUpperCase()}
        </text>
      </g>

      <g transform="translate(70 820)" fill={INK} fontFamily="IM Fell English, Palatino, serif" fontSize="13">
        <path d="M0 0 H70" stroke={INK} strokeWidth="1.4" />
        <path d="M0 -4 V4 M35 -3 V3 M70 -4 V4" stroke={INK} />
        <text y="16">three leagues</text>
      </g>

      <rect x="14" y="14" width={MAP.width - 28} height={MAP.height - 28} fill="none" stroke={INK} strokeWidth="2.2" />
      <rect x="20" y="20" width={MAP.width - 40} height={MAP.height - 40} fill="none" stroke={INK} strokeWidth="0.8" />
    </g>
  )
}
