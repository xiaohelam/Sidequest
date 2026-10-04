/**
 * The hall at Homebase. Purchased furniture is drawn on top of a spare room.
 * Each furnishing's `data-furnishing` id matches `src/config/shop.ts`.
 */

export function Room({ owned }: { owned: string[] }) {
  const has = (id: string) => owned.includes(id)

  return (
    <svg viewBox="0 0 800 520" className="h-auto max-h-full w-full" role="img" aria-label="Your hall">
      <rect width="800" height="340" fill="#dcc7a4" />
      <rect y="330" width="800" height="18" fill="#6b4423" stroke="#3a2714" />
      <rect y="348" width="800" height="172" fill="#8b5a32" />
      {Array.from({ length: 8 }, (_, index) => (
        <line
          key={index}
          x1="0"
          x2="800"
          y1={368 + index * 20}
          y2={368 + index * 20}
          stroke="#6b4423"
          strokeOpacity="0.45"
        />
      ))}

      <g transform="translate(500 48)">
        <rect width="200" height="210" fill="#5c3a22" stroke="#3a2714" strokeWidth="3" />
        <rect x="12" y="12" width="176" height="186" fill="#8ea4ab" stroke="#3a2714" />
        <path d="M12 140 L50 100 L90 132 L140 78 L188 140 V198 H12 Z" fill="#6d7f52" stroke="#3a2714" />
        <circle cx="150" cy="42" r="14" fill="#e6c56a" stroke="#3a2714" />
        <path d="M100 12 V198 M12 100 H188" stroke="#5c3a22" strokeWidth="3" />
      </g>

      <ellipse cx="300" cy="450" rx="130" ry="36" fill="#7a3142" stroke="#3a2714" />
      <ellipse cx="300" cy="450" rx="80" ry="20" fill="#6b2434" />

      <g transform="translate(150 400)">
        <rect x="8" y="18" width="12" height="30" fill="#f6edd8" stroke="#3a2714" />
        <path d="M14 18 C10 10 18 8 14 2 C18 10 20 10 14 18 Z" fill="#c46a3a" stroke="#3a2714" />
      </g>

      {has('bookshelf') && (
        <g data-furnishing="bookshelf" className="item-in" transform="translate(48 70)">
          <rect width="130" height="260" fill="#6b4423" stroke="#3a2714" strokeWidth="2" />
          {[55, 115, 175, 230].map((y) => (
            <line key={y} x1="8" x2="122" y1={y} y2={y} stroke="#3a2714" strokeWidth="4" />
          ))}
          <rect x="14" y="20" width="12" height="35" fill="#7a3142" stroke="#3a2714" />
          <rect x="28" y="26" width="10" height="29" fill="#3e5c45" stroke="#3a2714" />
          <rect x="40" y="16" width="14" height="39" fill="#b8923a" stroke="#3a2714" />
          <rect x="56" y="24" width="11" height="31" fill="#5c6b73" stroke="#3a2714" />
          <rect x="70" y="18" width="13" height="37" fill="#f0e2c4" stroke="#3a2714" />
          <rect x="86" y="28" width="12" height="27" fill="#7a3142" stroke="#3a2714" />
          <rect x="16" y="78" width="18" height="37" fill="#3e5c45" stroke="#3a2714" />
          <rect x="36" y="84" width="14" height="31" fill="#7a3142" stroke="#3a2714" />
          <rect x="52" y="74" width="16" height="41" fill="#e6c56a" stroke="#3a2714" />
          <rect x="70" y="82" width="12" height="33" fill="#5c3a22" stroke="#3a2714" />
          <rect x="18" y="136" width="22" height="39" fill="#f0e2c4" stroke="#3a2714" />
          <rect x="42" y="144" width="14" height="31" fill="#7a3142" stroke="#3a2714" />
          <rect x="58" y="132" width="16" height="43" fill="#3e5c45" stroke="#3a2714" />
        </g>
      )}

      {has('fireplace') && (
        <g data-furnishing="fireplace" className="item-in" transform="translate(220 130)">
          <rect x="8" y="36" width="190" height="164" fill="#8a847c" stroke="#3a2714" strokeWidth="2" />
          <path d="M28 190 V110 H178 V190" fill="#2a1c14" stroke="#3a2714" />
          <path d="M96 186 C84 156 68 150 78 124 C90 146 96 140 100 118 C112 148 132 140 120 168 C114 180 104 186 96 186 Z" fill="#c46a3a" stroke="#3a2714" />
          <path d="M98 176 C92 158 100 146 100 138 C110 156 114 154 106 176 Z" fill="#e6c56a" />
          <rect y="24" width="206" height="18" fill="#5c3a22" stroke="#3a2714" />
        </g>
      )}

      {has('painting') && (
        <g data-furnishing="painting" className="item-in" transform="translate(268 46)">
          <rect width="110" height="84" fill="#b8923a" stroke="#3a2714" strokeWidth="2" />
          <rect x="8" y="8" width="94" height="68" fill="#8ea4ab" stroke="#3a2714" />
          <path d="M8 52 L32 32 L50 46 L74 26 L102 52 V76 H8 Z" fill="#6d7f52" stroke="#3a2714" />
          <circle cx="78" cy="24" r="7" fill="#e6c56a" stroke="#3a2714" />
        </g>
      )}

      {has('plant') && (
        <g data-furnishing="plant" className="item-in" transform="translate(430 390)">
          <path d="M18 78 H58 L50 42 H26 Z" fill="#a3533a" stroke="#3a2714" strokeWidth="1.4" />
          <path d="M38 44 C8 30 6 4 30 12 C20 24 32 34 38 44 Z" fill="#3e5a46" stroke="#3a2714" />
          <path d="M38 44 C68 22 78 6 52 8 C46 24 40 34 38 44 Z" fill="#4e6b52" stroke="#3a2714" />
          <path d="M38 46 C18 16 40 0 42 22 C46 8 64 10 52 32" fill="#2f4a38" stroke="#3a2714" />
        </g>
      )}

      {has('telescope') && (
        <g data-furnishing="telescope" className="item-in" transform="translate(680 360)">
          <path d="M36 24 L12 100" stroke="#3a2714" strokeWidth="3" />
          <path d="M36 24 L62 100" stroke="#3a2714" strokeWidth="3" />
          <path d="M36 24 L36 104" stroke="#3a2714" strokeWidth="3" />
          <polygon points="4,34 78,8 86,22 12,48" fill="#c4a15a" stroke="#3a2714" strokeWidth="1.5" />
          <circle cx="84" cy="14" r="9" fill="#d5e0e2" stroke="#3a2714" />
        </g>
      )}
    </svg>
  )
}
