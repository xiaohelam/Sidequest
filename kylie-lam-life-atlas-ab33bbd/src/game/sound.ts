/**
 * Tiny synthesized chimes. No audio files — if the browser blocks sound,
 * the game simply stays quiet.
 */

import { useEffect, useState } from 'react'

let audio: AudioContext | null = null

function context(): AudioContext | null {
  try {
    const Ctx = window.AudioContext
    if (!Ctx) return null
    audio = audio ?? new Ctx()
    if (audio.state === 'suspended') void audio.resume()
    return audio
  } catch {
    return null
  }
}

const SOUND_KEY = 'sidequest-chime'

export function chimeEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

export function setChimeEnabled(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
  } catch {
    // The animation still works if the preference cannot be stored.
  }
  window.dispatchEvent(new Event('sidequest-chime'))
}

function tone(
  ctx: AudioContext,
  frequency: number,
  when: number,
  duration: number,
  volume: number,
  shape: OscillatorType = 'triangle',
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = shape
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(volume, when + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(when)
  osc.stop(when + duration + 0.02)
}

export function playCoins(): void {
  if (!chimeEnabled()) return
  const ctx = context()
  if (!ctx) return
  const now = ctx.currentTime
  tone(ctx, 523, now, 0.18, 0.05)
  tone(ctx, 659, now + 0.06, 0.18, 0.05)
  tone(ctx, 784, now + 0.12, 0.22, 0.045)
}

export function playPlace(): void {
  if (!chimeEnabled()) return
  const ctx = context()
  if (!ctx) return
  const now = ctx.currentTime
  tone(ctx, 392, now, 0.2, 0.04)
  tone(ctx, 523, now + 0.1, 0.28, 0.04)
}

/** A short magical chime. Silent if the player turned sound off, or the browser blocked it. */
export function playLevelUp(): void {
  if (!chimeEnabled()) return
  const ctx = context()
  if (!ctx) return
  try {
    const now = ctx.currentTime
    tone(ctx, 1174, now, 0.09, 0.018, 'sine')
    tone(ctx, 1568, now + 0.07, 0.12, 0.02, 'sine')
    tone(ctx, 1975, now + 0.14, 0.16, 0.016, 'sine')
    tone(ctx, 523, now + 0.2, 0.42, 0.04, 'triangle')
    tone(ctx, 659, now + 0.32, 0.4, 0.038, 'triangle')
    tone(ctx, 784, now + 0.46, 0.38, 0.036, 'triangle')
    tone(ctx, 1046, now + 0.62, 0.55, 0.042, 'triangle')
  } catch {
    // The level-up page still plays if the audio graph cannot start.
  }
}

export function useChime(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(chimeEnabled)
  useEffect(() => {
    const sync = () => setOn(chimeEnabled())
    window.addEventListener('sidequest-chime', sync)
    return () => window.removeEventListener('sidequest-chime', sync)
  }, [])
  return [on, setChimeEnabled]
}
