/**
 * The scribe reads a goal, decides what kind of effort it is, and offers
 * actions a person could actually do. Nothing is added until the player accepts it.
 *
 * These plans are the answer when no AI key is set, and when the guide cannot
 * answer. The hand-written sets live in this file and in domains.ts.
 */

import { DOMAINS, classifyKind, type QuestSeed, type Stage } from './domains.ts'
import { topicFrom } from './naming.ts'
import { rewardFor } from './rewards.ts'
import type { Priority } from './types.ts'

export type ScribeMode = 'foundation' | 'challenge' | 'quick' | 'long' | 'surprise'

export type ScribeBrief = {
  level: '' | 'beginner' | 'intermediate' | 'advanced'
  focus: string
  time: '' | '15' | '30' | '60'
  note: string
}

export type Suggestion = {
  id: string
  title: string
  action: string
  why: string
  stage: Stage
  difficulty: 1 | 2 | 3
  priority: Priority
  coins: number
  xp: number
  minutes: number
  /** Short name stored on the quest. */
  label: string
  /** Action plus the reason, stored on the quest. */
  description: string
}

const STAGE_ORDER: Stage[] = ['Foundation', 'Practice', 'Application', 'Challenge', 'Reflection']

function priorityFor(difficulty: 1 | 2 | 3): Priority {
  if (difficulty === 1) return 'low'
  if (difficulty === 3) return 'high'
  return 'medium'
}

function toSuggestion(seed: QuestSeed): Suggestion {
  const priority = priorityFor(seed.difficulty)
  const reward = rewardFor(priority)
  return {
    id: crypto.randomUUID(),
    title: seed.title,
    action: seed.action,
    why: seed.why,
    stage: seed.stage,
    difficulty: seed.difficulty,
    priority,
    coins: reward.coins,
    xp: reward.xp,
    minutes: seed.minutes,
    label: seed.title,
    description: `${seed.action} ${seed.why}`,
  }
}

function activityName(idea: string): string {
  const topic = topicFrom(idea).replace(/[.!?]+$/g, '').trim()
  return topic.length > 0 ? topic : idea.trim()
}

/** Plans for a goal we do not have a hand-written set for. The activity name is used as a real noun. */
function fallbackSeeds(idea: string): QuestSeed[] {
  const name = activityName(idea)
  const kind = classifyKind(idea)
  if (kind === 'sport') {
    return [
      { title: 'The basic movement', action: `Spend 10 minutes on the simplest movement in ${name}, slowly enough to notice what your body does.`, why: 'A movement you can feel is the base every later session builds on.', stage: 'Foundation', difficulty: 1, minutes: 10, focuses: ['technique'] },
      { title: 'Four easy repeats', action: `Do four short repeats of ${name}, resting between them, and keep one thing the same each time.`, why: 'Repeats show you the difference between a lucky try and a repeatable one.', stage: 'Practice', difficulty: 2, minutes: 20, focuses: ['technique'] },
      { title: 'A steady piece', action: `Do a continuous easy bout of ${name} for as long as your form still holds.`, why: 'Endurance only counts while the movement still looks like the one you practiced.', stage: 'Application', difficulty: 2, minutes: 25, focuses: ['endurance'] },
      { title: 'A measured effort', action: `Do one harder, timed effort of ${name} and write the result down.`, why: 'A number turns “better” into something you can compare next time.', stage: 'Challenge', difficulty: 3, minutes: 20, focuses: ['speed'] },
      { title: 'What changed', action: `Repeat a short piece of ${name} and note one thing that felt different from last time.`, why: 'The note is how you keep the gain instead of starting over.', stage: 'Reflection', difficulty: 1, minutes: 15 },
    ]
  }
  if (kind === 'creative-skill' || kind === 'creative-project' || kind === 'hobby') {
    return [
      { title: 'The smallest finished piece', action: `Make the smallest complete version of ${name} you can finish in one sitting.`, why: 'A finished scrap teaches more than a perfect plan.', stage: 'Foundation', difficulty: 1, minutes: 25 },
      { title: 'One skill, on purpose', action: `Practice one specific technique of ${name} for 15 minutes, and ignore everything else.`, why: 'One technique, repeated, is how a skill stops being a blur.', stage: 'Practice', difficulty: 2, minutes: 15, focuses: ['technique'] },
      { title: 'Use it in a real piece', action: `Use that technique inside a small real attempt at ${name}.`, why: 'A technique only counts once it survives contact with the actual work.', stage: 'Application', difficulty: 2, minutes: 30 },
      { title: 'A harder attempt', action: `Try a version of ${name} that is one step past what you can already do comfortably.`, why: 'The step just past comfort is where the skill grows.', stage: 'Challenge', difficulty: 3, minutes: 40 },
      { title: 'What you would change', action: `Look at what you made and write the one change you would make next time.`, why: 'The next attempt should answer that note.', stage: 'Reflection', difficulty: 1, minutes: 10 },
    ]
  }
  if (kind === 'health') {
    return [
      { title: 'A small daily version', action: `Do a 10-minute version of ${name} that you could repeat tomorrow.`, why: 'A version you can repeat beats a version you can only do once.', stage: 'Foundation', difficulty: 1, minutes: 10 },
      { title: 'Three days', action: `Do that same short version of ${name} on three separate days.`, why: 'Three days is enough to feel whether it fits your actual life.', stage: 'Practice', difficulty: 2, minutes: 10 },
      { title: 'Notice the effect', action: `After one session of ${name}, write one sentence about how you felt.`, why: 'The feeling is the feedback. Without it, the habit is only a checkbox.', stage: 'Reflection', difficulty: 1, minutes: 5 },
      { title: 'A slightly longer day', action: `On one day, give ${name} a little more time than the short version.`, why: 'Length is a choice you make after the short version is easy.', stage: 'Challenge', difficulty: 2, minutes: 25 },
    ]
  }
  return [
    { title: 'A first real attempt', action: `Do the smallest real example of ${name} that you can finish today.`, why: 'Finishing a small example shows you what the work actually is.', stage: 'Foundation', difficulty: 1, minutes: 25 },
    { title: 'Repeat and change one thing', action: `Do that example of ${name} again and change one thing on purpose.`, why: 'The second attempt is where you start to understand the first.', stage: 'Practice', difficulty: 2, minutes: 25 },
    { title: 'Use it for something you care about', action: `Use ${name} on a small problem or piece of work that is actually yours.`, why: 'Your own material shows whether you can use the skill, not only follow it.', stage: 'Application', difficulty: 2, minutes: 40 },
    { title: 'A step past comfort', action: `Attempt a slightly harder piece of ${name} than the one you can already finish.`, why: 'The next step should be visible from where you are, not a different subject.', stage: 'Challenge', difficulty: 3, minutes: 40 },
    { title: 'What you can do now', action: `Write down what you can do in ${name} today that you could not do before this work.`, why: 'Naming the gain keeps it from disappearing into a vague sense of progress.', stage: 'Reflection', difficulty: 1, minutes: 10 },
  ]
}

function prefer(pool: QuestSeed[], test: (seed: QuestSeed) => boolean): QuestSeed[] {
  const matched = pool.filter(test)
  return matched.length >= 3 ? matched : pool
}

function unused(seeds: QuestSeed[], taken: Set<string>): QuestSeed[] {
  return seeds.filter((seed) => !taken.has(seed.title.trim().toLowerCase()) && !taken.has(seed.action.trim().toLowerCase()))
}

function pick(pool: QuestSeed[], mode: ScribeMode, brief: ScribeBrief): QuestSeed[] {
  let working = pool
  if (brief.level === 'beginner') working = prefer(working, (seed) => seed.difficulty <= 2)
  if (brief.level === 'advanced') working = prefer(working, (seed) => seed.difficulty >= 2)
  if (brief.focus.trim()) {
    const focus = brief.focus.trim().toLowerCase()
    working = prefer(working, (seed) => (seed.focuses ?? []).some((item) => item.includes(focus) || focus.includes(item)) || `${seed.title} ${seed.action} ${seed.why}`.toLowerCase().includes(focus))
  }
  if (brief.time === '15') working = prefer(working, (seed) => seed.minutes <= 20)
  if (brief.time === '30') working = prefer(working, (seed) => seed.minutes <= 40)
  if (brief.time === '60') working = prefer(working, (seed) => seed.minutes >= 20)
  if (brief.note.trim()) {
    const words = brief.note.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3)
    const hits = working.filter((seed) => words.some((word) => `${seed.title} ${seed.action} ${seed.why}`.toLowerCase().includes(word)))
    if (hits.length >= 2) working = [...hits, ...working.filter((seed) => !hits.includes(seed))]
  }

  if (mode === 'quick') return working.filter((seed) => seed.minutes <= 20 && seed.difficulty <= 2).slice(0, 4)
  if (mode === 'foundation') return working.filter((seed) => seed.stage === 'Foundation' || seed.stage === 'Practice').slice(0, 5)
  if (mode === 'challenge') return working.filter((seed) => seed.stage === 'Challenge' || seed.stage === 'Application').slice(0, 4)
  if (mode === 'long') {
    const chosen: QuestSeed[] = []
    for (const stage of STAGE_ORDER) {
      const found = working.find((seed) => seed.stage === stage && !chosen.includes(seed))
      if (found) chosen.push(found)
    }
    return chosen
  }
  const mixed = [...working]
  for (let index = mixed.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[mixed[index], mixed[swap]] = [mixed[swap], mixed[index]]
  }
  return mixed.slice(0, 5)
}

export function suggestQuests(idea: string, existingLabels: string[], brief: ScribeBrief, mode: ScribeMode): Suggestion[] {
  const domain = DOMAINS.find((entry) => entry.test.test(idea))
  const seeds = domain?.seeds ?? fallbackSeeds(idea)
  const taken = new Set(existingLabels.map((label) => label.trim().toLowerCase()))
  let chosen = pick(unused(seeds, taken), mode, brief)
  if (chosen.length === 0) chosen = unused(seeds, taken).slice(0, 4)
  return chosen.map(toSuggestion)
}

export function goalKindLabel(idea: string): string {
  const kind = classifyKind(idea)
  const names: Record<string, string> = {
    sport: 'Sport and physical skill',
    'creative-skill': 'Creative skill',
    'creative-project': 'Creative project',
    hobby: 'Hobby',
    learning: 'Learning',
    academic: 'Academic subject',
    career: 'Career',
    travel: 'Travel',
    health: 'Health and wellbeing',
    social: 'Social goal',
    habit: 'Habit',
    'personal-project': 'Personal project',
  }
  return names[kind] ?? 'A personal goal'
}
