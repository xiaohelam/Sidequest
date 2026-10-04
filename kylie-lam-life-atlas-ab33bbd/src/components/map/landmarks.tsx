/**
 * Homebase. The cottage is the only landmark that exists before the player
 * writes an idea. Other lands are drawn in kingdomArt.tsx.
 */

const INK = '#3a2714'

export function HomeArt() {
  return (
    <g>
      <ellipse cx="4" cy="28" rx="38" ry="9" fill="rgba(48,32,16,0.18)" />
      <path d="M-34 24 L-30 -8 L30 -12 L36 22 Z" fill="#f0e2c4" stroke={INK} strokeWidth="1.6" />
      <path d="M-40 -6 L2 -48 L42 -8 L30 -10 L-30 -8 Z" fill="#c4a15a" stroke={INK} strokeWidth="1.6" />
      <rect x="18" y="-28" width="8" height="18" fill="#6b4423" stroke={INK} />
      <circle className="smoke" cx="22" cy="-40" r="4" fill="#8d8680" />
      <circle className="smoke" cx="28" cy="-50" r="3" fill="#8d8680" style={{ animationDelay: '0.6s' }} />
      <rect x="-6" y="2" width="14" height="22" fill="#4a2e1c" stroke={INK} />
      <circle cx="5" cy="14" r="1.2" fill="#e6c56a" />
      <rect x="-24" y="-2" width="12" height="12" fill="#f0c56a" stroke={INK} />
      <path d="M-18 -2 V10 M-24 4 H-12" stroke={INK} strokeWidth="1" />
      <path d="M-44 22 Q-36 8 -28 22" fill="#5f7348" stroke={INK} />
      <circle cx="-36" cy="16" r="2" fill="#7a3142" />
      <path d="M28 20 H46" stroke="#6b4423" strokeWidth="2" />
      <circle cx="40" cy="12" r="3" fill="#e6c56a" stroke={INK} />
      <path d="M40 15 V22" stroke={INK} />
    </g>
  )
}
