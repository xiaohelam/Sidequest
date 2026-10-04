export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = 'Keep my realm',
  onConfirm,
  onCancel,
}: {
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#3a2714]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="panel w-full max-w-md p-6">
        <h2 id="confirm-title" className="font-display text-2xl">
          {title}
        </h2>
        <p className="mt-2 font-manuscript text-xl italic leading-snug">{body}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="ink-button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="ink-button solid" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
