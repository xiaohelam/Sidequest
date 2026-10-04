export function CoinIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#e6c56a" stroke="#3a2714" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="#8a6a2e" strokeWidth="1.2" />
      <path d="M12 7.5 V16.5 M9.5 9.5 H13.2 C14.4 9.5 15 10.2 15 11.1 C15 12 14.3 12.6 13.1 12.6 H9.5" fill="none" stroke="#3a2714" strokeWidth="1.2" />
    </svg>
  )
}

export function TorchIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M10 22 H14 L13 13 H11 Z" fill="#6b4423" stroke="#3a2714" strokeWidth="1.2" />
      <path d="M12 13 C8 11 7 6 12 2 C17 6 16 11 12 13 Z" fill="#c46a3a" stroke="#3a2714" strokeWidth="1.2" />
      <path d="M12 12 C10.5 10 11 7 12 5.5 C13 7.2 13.4 9.2 12 12 Z" fill="#e6c56a" />
    </svg>
  )
}

export function WaxSeal({ className = 'h-14 w-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M32 6 C44 5 57 16 57 30 C58 45 47 58 32 57 C16 58 6 45 7 30 C6 15 18 5 32 6 Z"
        fill="#7a3142"
        stroke="#3a2714"
        strokeWidth="2"
      />
      <circle cx="32" cy="32" r="16" fill="none" stroke="#e6c56a" strokeWidth="1.4" />
      <path d="M32 18 L35.2 28 H46 L37.4 34 L40.6 44 L32 38.2 L23.4 44 L26.6 34 L18 28 H28.8 Z" fill="#e6c56a" />
    </svg>
  )
}
