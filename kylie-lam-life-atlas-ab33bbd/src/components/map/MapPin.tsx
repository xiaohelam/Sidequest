import type { ReactNode } from 'react'

type Status = 'empty' | 'open' | 'done'

function ribbon(anchor: 'above' | 'below') {
  if (anchor === 'above') return `translate(0 -108)`
  return `translate(0 84)`
}

export function MapPin({
  id,
  name,
  x,
  y,
  label,
  status,
  art,
  rising,
  dimmed,
  focused,
  detail,
  preview,
  onSelect,
}: {
  id: string
  name: string
  x: number
  y: number
  label: 'above' | 'below'
  status: Status
  art: ReactNode
  rising?: boolean
  dimmed?: boolean
  focused?: boolean
  detail?: string
  preview?: string
  onSelect: (id: string) => void
}) {
  const text = name.toUpperCase()
  const fontSize = text.length > 22 ? 10 : text.length > 16 ? 11 : 13
  const width = Math.max(108, Math.min(250, text.length * (fontSize <= 11 ? 6.7 : 8) + 28))

  return (
    <g
      data-place={id}
      transform={`translate(${x} ${y})`}
      opacity={dimmed ? 0.42 : 1}
      className={`place ${focused ? 'land-focus' : ''}`}
      role="button"
      tabIndex={0}
      pointerEvents="bounding-box"
      aria-label={status === 'empty' && id !== 'home' ? `${name}, quests not written yet` : name} onClick={() => onSelect(id)} onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(id)
        }
      }}
    >
      <g className={rising ? 'land-rise' : undefined}>
      {rising && <ellipse className="land-glow" cx="4" cy="16" rx="74" ry="30" fill="#e6c56a" />}
      {focused && <ellipse cx="4" cy="18" rx="78" ry="32" fill="none" stroke="#b8923a" strokeWidth="1.6" strokeDasharray="4 3" />}
      <g className="place-art">{art}</g>
      <g transform={ribbon(label)}>
        <path
          d={`M ${-width / 2 + 8} -14 H ${width / 2 - 8} L ${width / 2} 0 L ${width / 2 - 8} 14 H ${-width / 2 + 8} L ${-width / 2} 0 Z`}
          fill={focused ? '#fff8e8' : '#f6edd8'}
          stroke="#3a2714"
          strokeWidth="1.3"
        />
        <text
          y="4"
          textAnchor="middle"
          fill="#3a2714"
          fontFamily="Cinzel, Palatino, serif"
          fontSize={fontSize}
          letterSpacing="0.04em"
        >
          {text}
        </text>
        {status !== 'empty' && (
          <g transform={`translate(${width / 2 - 2} -16)`}>
            <circle r="9" fill={status === 'done' ? '#b8923a' : '#7a3142'} stroke="#3a2714" />
            <text y="3" textAnchor="middle" fontSize="9" fill="#f6edd8" fontFamily="Cinzel, Palatino, serif">
              {status === 'done' ? '✓' : '!'}
            </text>
          </g>
        )}
      </g>
      {preview && (
        <g className="pin-preview" transform={label === 'above' ? 'translate(0 -132)' : 'translate(0 108)'}>
          <rect x="-78" y="-12" width="156" height="22" rx="2" fill="#f6edd8" stroke="#3a2714" />
          <text y="3" textAnchor="middle" fill="#5e4632" fontFamily="IM Fell English, Palatino, serif" fontSize="12">
            {preview.length > 28 ? `${preview.slice(0, 26)}…` : preview}
          </text>
        </g>
      )}
      {focused && detail && (
        <text y={label === 'above' ? -78 : 112} textAnchor="middle" fill="#5e4632" fontFamily="IM Fell English, Palatino, serif" fontSize="13">
          {detail}
        </text>
      )}
      </g>
    </g>
  )
}
