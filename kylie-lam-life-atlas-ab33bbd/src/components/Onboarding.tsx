import { useState } from 'react'
import { APP_NAME, MAX_IDEAS, SAMPLE_IDEAS, TAGLINE } from '../config/app.ts'
import { useGame } from '../game/context.ts'
import { WaxSeal } from './icons.tsx'

export function Onboarding() {
  const game = useGame()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const result = game.beginAdventure(text)
    if (!result.ok) setError(result.reason)
  }

  return (
    <div className="h-full overflow-auto px-4 py-6">
      <div className="manuscript-frame mx-auto w-full max-w-3xl px-6 py-7 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <CompassMark />
          <p className="font-display text-center text-xs tracking-[0.22em] text-ink sm:text-sm">YOUR ADVENTURE BEGINS HERE</p>
          <Quill />
        </div>

        <h1 className="mt-4 text-center font-display text-5xl tracking-wide text-ink sm:text-6xl">{APP_NAME}</h1>
        <p className="mx-auto mt-3 max-w-xl text-center font-manuscript text-xl italic leading-snug text-ink-soft sm:text-2xl">
          {TAGLINE}
        </p>

        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <label htmlFor="ideas" className="block font-display text-lg tracking-wide text-ink">
            What&apos;s been taking up space in your mind?
          </label>
          <p className="mt-1 text-sm text-ink-soft">
            One idea per line, up to {MAX_IDEAS}. Each line becomes its own land. You will write the quests — nothing is filled in for you.
          </p>
          <textarea
            id="ideas"
            className="ink-area mt-3"
            value={text}
            placeholder={SAMPLE_IDEAS}
            onChange={(event) => {
              setText(event.target.value)
              if (error) setError(null)
            }}
          />
          {error && (
            <p role="alert" className="mt-2 font-manuscript text-lg text-burgundy">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button type="submit" className="wax-button">
              <WaxSeal />
              <span>Map my adventure</span>
            </button>
            <button
              type="button"
              className="link-ink"
              onClick={() => {
                setText(SAMPLE_IDEAS)
                setError(null)
              }}
            >
              Use the sample list
            </button>
            <button type="button" className="link-ink" onClick={() => game.enterRealm()}>
              Begin at homebase
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Your map stays on this device. A guide key on Journey is optional. With one, the quest you ask about is sent to OpenAI.
        </p>
      </div>
    </div>
  )
}

function CompassMark() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
      <circle cx="23" cy="23" r="18" fill="#f6edd8" stroke="#3a2714" strokeWidth="1.6" />
      <path d="M23 8 L27 23 L23 38 L19 23 Z" fill="#7a3142" stroke="#3a2714" />
      <circle cx="23" cy="23" r="2" fill="#e6c56a" />
    </svg>
  )
}

function Quill() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
      <path d="M10 38 C18 28 22 16 34 8 C28 18 26 26 30 34 C22 32 16 34 10 38 Z" fill="#f6edd8" stroke="#3a2714" />
      <path d="M10 38 L16 32" stroke="#3a2714" />
      <path d="M30 34 L38 40" stroke="#7a3142" strokeWidth="2" />
    </svg>
  )
}
