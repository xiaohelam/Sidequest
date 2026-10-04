/** The traveler. Feet sit on (x, y). `face` of -1 turns them around. */

const INK = '#3a2714'

export function HeroFigure({
  x,
  y,
  walking,
  face,
  notice = false,
  celebrating = false,
}: {
  x: number
  y: number
  walking: boolean
  face: 1 | -1
  notice?: boolean
  celebrating?: boolean
}) {
  const pose = celebrating ? 'hero-cheer' : walking ? 'hero-walk' : 'hero-idle'
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <g className={notice ? 'hero-notice' : undefined}>
        <ellipse cx="1" cy="8" rx="20" ry="5.5" fill="rgba(40,24,10,0.22)" />
        <g transform={`scale(${face * 1.15} 1.15)`}>
          <g className={pose}>
            <path d="M2 -26 C14 -28 16 -14 13 -6 C10 0 4 2 1 -6 Z" fill="#5c3d28" stroke={INK} strokeWidth="1" />
            <path d="M4 -20 H10 M5 -16 H11" stroke="#c4a15a" strokeWidth="0.9" />
            <path d="M6 -24 L11 -28" stroke="#e6c56a" strokeWidth="1.1" />
            <path className="cloak-tail" d="M-1 -32 C-24 -18 -22 6 -12 14 C-4 6 -7 -10 -1 -32" fill="#5c2432" stroke={INK} strokeWidth="1.05" />
            <path className="cloak-tail" d="M-2 -28 C-16 -16 -15 2 -8 10" fill="#7a3142" />
            <g className="boot-b">
              <path d="M-3 -4 L-7 12" stroke="#4a3424" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M-11 12 H-4" stroke="#2a1a0c" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M-9 9 H-5" stroke="#c4a15a" strokeWidth="0.8" />
            </g>
            <path d="M-7 -20 C-10 -6 -6 4 -1 2 C6 4 8 -8 2 -22 C0 -16 -2 -16 -7 -20" fill="#6b4423" stroke={INK} strokeWidth="0.9" />
            <path d="M-5 -26 C-14 -14 -12 2 -3 6 C2 0 0 -12 -1 -24 Z" fill="#7a3142" stroke={INK} strokeWidth="1.05" />
            <path d="M-8 -18 C-2 -14 3 -15 7 -20" fill="none" stroke="#e6c56a" strokeWidth="1.3" />
            <path d="M-4 -8 H5" stroke="#e6c56a" strokeWidth="1.4" />
            <g className="boot-a">
              <path d="M2 -2 L8 13" stroke="#5c4030" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M4 13 H12" stroke="#2a1a0c" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M6 10 H10" stroke="#c4a15a" strokeWidth="0.9" />
            </g>
            <path d="M-9 -16 L-16 -6" stroke="#e4c09a" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M6 -14 L13 -6" stroke="#e4c09a" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M5 -10 L12 -4 L14 -10 L7 -14 Z" fill="#8d6a3a" stroke={INK} strokeWidth="0.7" />
            <path d="M8 -13 L11 -16 L14 -12" fill="none" stroke={INK} strokeWidth="0.7" />
            <circle cx="0" cy="-34" r="7.4" fill="#e8c4a4" stroke={INK} strokeWidth="1.05" />
            <path d="M-8 -34 C-5 -48 9 -46 9 -33 C7 -40 -1 -40 -7 -34" fill="#5c2432" stroke={INK} strokeWidth="1" />
            <path d="M-6 -36 C-2 -42 6 -42 7 -35" fill="none" stroke="#7a3142" strokeWidth="1.2" />
            <path d="M-3 -38 C-1 -41 3 -40 4 -37" fill="#3a2714" />
            <circle cx="-2.3" cy="-34.2" r="0.75" fill={INK} />
            <circle cx="2.2" cy="-34.2" r="0.75" fill={INK} />
            <path d="M-1.2 -31.6 Q0.4 -30.6 2 -31.6" fill="none" stroke={INK} strokeWidth="0.6" />
            <circle cx="-1" cy="-22" r="1.3" fill="#e6c56a" stroke={INK} strokeWidth="0.5" />
            <path className="cloak-front" d="M5 -24 C14 -12 12 4 4 10" fill="none" stroke="#5c2432" strokeWidth="2.6" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </g>
  )
}
