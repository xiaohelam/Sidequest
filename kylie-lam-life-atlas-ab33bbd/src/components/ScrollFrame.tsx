import type { ReactNode } from 'react'

/** A parchment scroll with wooden rollers. Used for quests and the shop. */
export function ScrollFrame({
  children,
  label,
  onClose,
}: {
  children: ReactNode
  label: string
  onClose?: () => void
}) {
  return (
    <section className="flex h-full min-h-0 flex-col" aria-label={label}>
      <div className="roller" />
      <div className="relative min-h-0 flex-1 overflow-auto border-x-[6px] border-wood-dark bg-parchment px-4 py-4">
        {onClose && (
          <button type="button" className="link-ink absolute right-3 top-2 text-base" onClick={onClose}>
            Roll up
          </button>
        )}
        {children}
      </div>
      <div className="roller" />
    </section>
  )
}
