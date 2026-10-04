/**
 * Curated help for one quest.
 * The kingdom only chooses which catalog to open. The quest title and
 * description choose the guides. Results are stored on that quest
 * (kingdom id + quest id). There is no kingdom-wide resource cache.
 * Links were checked against live pages. A resource with no url is a note
 * written for the quest.
 */

import type { QuestResource, ResourceKind, StartStep } from './types.ts'

export type SupplyQuery = {
  idea: string
  kingdomName: string
  kingdomDescription: string
  category: string
  motif: string
  questLabel: string
  questDescription: string
  /** How demanding the quest is. Used only as a light hint. */
  priority: string
  minutes: number | null
  /** URLs already offered on other quests in this kingdom. */
  usedUrls: string[]
}

type Seed = {
  key: string
  kind: ResourceKind
  title: string
  source: string
  why: string
  url: string | null
  minutes: number | null
  /** Matched against the quest title and description only. */
  quest: RegExp
  /** Drop the seed when the quest is about something else. */
  avoid?: RegExp
  weight?: number
}

type Pack = {
  test: RegExp
  kit: string
  seeds: Seed[]
  path: (quest: string, label: string) => StartStep[]
}

const KIND_ORDER: ResourceKind[] = ['watch', 'read', 'explore', 'get', 'go', 'tool', 'checklist', 'inspire']

export const KIND_META: Record<ResourceKind, { name: string; action: string }> = {
  watch: { name: 'Watch', action: 'Watch' },
  read: { name: 'Read', action: 'Read' },
  explore: { name: 'Explore', action: 'Open guide' },
  get: { name: 'Get ready', action: 'View list' },
  go: { name: 'Go', action: 'Open map' },
  tool: { name: 'Tool', action: 'Open tool' },
  checklist: { name: 'Checklist', action: 'View list' },
  inspire: { name: 'Inspire', action: 'Open' },
}

function step(kind: StartStep['kind'], title: string, detail: string): StartStep {
  return { kind, title, detail }
}

function clip(text: string, max = 72): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).trim()}…`
}

function lowerFirst(text: string): string {
  if (!text) return text
  return text.charAt(0).toLowerCase() + text.slice(1)
}

/** Phrases the user added that a generic guide would miss. */
export function findConstraints(text: string): string[] {
  const patterns = [
    /does not require [^.]{3,80}/i,
    /do not require [^.]{3,80}/i,
    /doesn'?t require [^.]{3,80}/i,
    /without (?:a |an |the |any )[^.]{3,70}/i,
    /no dutch oven/i,
    /beginner[- ]friendly/i,
    /near (?:a )?(?:train |subway |metro )?station/i,
    /accessible by [^.]{3,50}/i,
    /by train/i,
  ]
  const found: string[] = []
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) found.push(match[0].replace(/\s+/g, ' ').trim().replace(/[,:;]+$/, ''))
  }
  return [...new Set(found)].slice(0, 3)
}

function exactPath(label: string, quest: string): StartStep[] {
  const constraints = findConstraints(quest)
  const limit = constraints.length ? ` Honor this: ${constraints.join('; ')}.` : ''
  return [
    step('checklist', 'Read the quest as you wrote it', `“${label}”.${limit}`),
    step('act', label, 'Do that specific thing. A general article about the kingdom does not finish it.'),
    step('act', 'Write the result', 'One or two lines that show this quest is done.'),
  ]
}

function branch(quest: string, label: string, cases: { test: RegExp; steps: StartStep[] }[]): StartStep[] {
  return cases.find((item) => item.test.test(quest))?.steps ?? exactPath(label, quest)
}

const NO_LOAF = /loaf|oven spring|scor|recipe|bake my|bake the/i
const NO_DUTCH = /without a dutch|no dutch|not require a dutch|does not require a dutch|do not require a dutch/i
const FEED = /feed|maintain|feeding schedule|keep a starter|doubles|ripe starter|healthy starter/i

const PACKS: Pack[] = [
  {
    test: /sourdough|starter/i,
    kit: "The Artisan's Tools",
    seeds: [
      {
        key: 'create',
        kind: 'read',
        title: 'How to create a sourdough starter',
        source: 'King Arthur Baking',
        why: 'Day-by-day amounts of flour and water for a new jar. Use this when you are mixing a starter, not when you are baking a loaf.',
        url: 'https://www.kingarthurbaking.com/recipes/sourdough-starter-recipe',
        minutes: 10,
        quest: /mix a starter|create a starter|new starter|from scratch|start a starter|equal weights of flour/i,
        avoid: /feed|loaf|oven spring|scor|bake/i,
        weight: 4,
      },
      {
        key: 'maintain',
        kind: 'read',
        title: 'How to feed and keep a starter',
        source: 'King Arthur Baking',
        why: 'The feeding guide: how much to keep, what to add, and the difference between the counter and the fridge.',
        url: 'https://www.kingarthurbaking.com/learn/guides/sourdough/maintain',
        minutes: 8,
        quest: FEED,
        avoid: NO_LOAF,
        weight: 6,
      },
      {
        key: 'healthy',
        kind: 'explore',
        title: 'What a healthy starter looks like',
        source: 'King Arthur Baking',
        why: 'A day-by-day look at a starter becoming active, and how to tell it is ready to bake. Stop when you can recognize that. The loaf later on this page is a different quest.',
        url: 'https://www.kingarthurbaking.com/blog/2024/02/28/sourdough-for-beginners',
        minutes: 12,
        quest: /feed|healthy starter|looks like|ready to bake|doubles|ripe starter|bubble/i,
        avoid: NO_LOAF,
        weight: 3,
      },
      {
        key: 'schedule',
        kind: 'checklist',
        title: 'A feeding schedule you can keep',
        source: 'Written for this quest',
        why: 'Follow the amounts on the King Arthur feeding guide. Feed after the starter has risen and started to fall, not because a clock said so. The fridge schedule in that guide is the slow version, not a dead starter.',
        url: null,
        minutes: 8,
        quest: FEED,
        avoid: NO_LOAF,
      },
      {
        key: 'hydration',
        kind: 'read',
        title: 'What hydration means in the jar',
        source: 'Written for this quest',
        why: 'Equal weights of flour and water are 100% hydration, the usual home starter. Stiffer means less water. Wetter means more. If you change it, write the grams down so the next feed matches. Use the feeding guide’s numbers rather than guessing.',
        url: null,
        minutes: 6,
        quest: /feed|hydrat|discard|how much flour|how much water|ratio/i,
        avoid: NO_LOAF,
      },
      {
        key: 'starter-trouble',
        kind: 'checklist',
        title: 'When a starter smells wrong or will not rise',
        source: 'Written for this quest',
        why: 'Gray liquid on top is hooch: stir it in or pour it off, then feed. A sharp nail-polish smell usually wants a few extra feedings. Fuzzy mold, or pink and orange streaks, means start a new jar. Do not bake with that one.',
        url: null,
        minutes: 6,
        quest: FEED,
        avoid: NO_LOAF,
      },
      {
        key: 'recipe',
        kind: 'read',
        title: 'Basic sourdough bread recipe',
        source: 'King Arthur Baking',
        why: 'One beginner loaf, from mixing through the bake. Stay with this recipe. A young starter can still use the yeast backup it describes.',
        url: 'https://www.kingarthurbaking.com/recipes/basic-sourdough-bread-recipe',
        minutes: 8,
        quest: /first loaf|bake my first|bake the first|basic sourdough|bread recipe|sourdough recipe|beginner recipe|mix the first dough|first dough/i,
        avoid: /oven spring|scor|feed my|feed the|feed until|maintain a starter|without a dutch|no dutch|not require a dutch|does not require a dutch|do not require a dutch/i,
        weight: 6,
      },
      {
        key: 'dutch',
        kind: 'explore',
        title: 'Dutch oven and covered-pot baking',
        source: 'King Arthur Baking',
        why: 'How a hot lidded pot traps steam so a first loaf can rise. Preheat the pot. Take the lid off partway through so the crust can dry.',
        url: 'https://www.kingarthurbaking.com/blog/2024/02/27/covered-baker-bread-steaming',
        minutes: 8,
        quest: /dutch oven|covered pot|first loaf|bake my first|bake the first|lidded/i,
        avoid: /oven spring|scor|feed|without a dutch|no dutch|not require a dutch|does not require a dutch|do not require a dutch/i,
        weight: 4,
      },
      {
        key: 'shape',
        kind: 'checklist',
        title: 'Shape the first loaf',
        source: 'Written for this quest',
        why: 'After the dough has risen, turn it out and tighten the surface into a round. A tight skin is what lets the loaf spring in the oven. Then follow the rest time in the one recipe you chose.',
        url: null,
        minutes: 8,
        quest: /first loaf|bake my first|bake the first|shap/i,
        avoid: /oven spring|scor|feed my|feed the|feed until/i,
      },
      {
        key: 'ferment',
        kind: 'read',
        title: 'How long the first dough should ferment',
        source: 'Written for this quest',
        why: 'Bulk fermentation is done when the dough is puffy and a damp finger leaves a dent that slowly springs back. A cold kitchen takes longer. The recipe’s clock is a starting point. Bake when the dough says so.',
        url: null,
        minutes: 6,
        quest: /first loaf|bake my first|bake the first|ferment|proof|first dough/i,
        avoid: /oven spring|scor|feed my|feed the|feed until/i,
      },
      {
        key: 'loaf-trouble',
        kind: 'checklist',
        title: 'If the first loaf is dense or flat',
        source: 'Written for this quest',
        why: 'A flat first loaf is usually a starter that had not peaked, a dough that overproofed, or a bake with no steam. Change one of those next time, and write which one you suspect before you mix again.',
        url: null,
        minutes: 6,
        quest: /first loaf|bake my first|bake the first|dense|flat loaf|troubleshoot/i,
        avoid: /oven spring|scor|feed my|feed the/i,
      },
      {
        key: 'score-how',
        kind: 'read',
        title: 'How to score bread dough',
        source: 'King Arthur Baking',
        why: 'Scoring gives oven spring a place to open. A curved blade, held at a shallow angle, makes an ear. A straight cut opens wider. The pictures show both.',
        url: 'https://www.kingarthurbaking.com/blog/2017/08/04/scoring-bread-dough',
        minutes: 8,
        quest: /oven spring|scor|slash|lame|\bear\b/i,
        weight: 5,
      },
      {
        key: 'score-why',
        kind: 'explore',
        title: 'How much scoring changes the rise',
        source: 'King Arthur Baking',
        why: 'A side-by-side of scored and unscored loaves, and why a score does little without steam. This is the explanation of oven spring, with the pictures.',
        url: 'https://www.kingarthurbaking.com/blog/2024/05/30/scoring-bread-dough',
        minutes: 8,
        quest: /oven spring|scor|slash|spring/i,
        weight: 4,
      },
      {
        key: 'steam',
        kind: 'read',
        title: 'Baking bread with steam at home',
        source: 'King Arthur Baking',
        why: 'Steam keeps the crust soft long enough for oven spring. A Dutch oven is one method. A pan of hot water, or a metal bowl over the loaf, is another. Use a method you actually have.',
        url: 'https://www.kingarthurbaking.com/blog/2024/04/26/baking-bread-with-steam-at-home',
        minutes: 9,
        quest: /oven spring|steam|scor|without a dutch|no dutch|not require a dutch|does not require a dutch|do not require a dutch/i,
        weight: 5,
      },
      {
        key: 'spring-notes',
        kind: 'checklist',
        title: 'What changes oven spring',
        source: 'Written for this quest',
        why: 'Score just before the bake. Steam, or a hot lidded pot, keeps the crust soft while the loaf rises. A tight shape and a starter that peaked recently both add height. Try those in that order, using the scoring and steam guides for the pictures.',
        url: null,
        minutes: 6,
        quest: /oven spring|scor|spring/i,
      },
      {
        key: 'no-dutch',
        kind: 'checklist',
        title: 'A beginner loaf with no Dutch oven',
        source: 'Written for this quest',
        why: 'You asked for a beginner sourdough recipe that does not require a Dutch oven. Mix a simple dough of ripe starter, flour, water, and salt. Bake it on a preheated sheet, with a pan of hot water on a lower rack, or under an overturned metal bowl. The steam guide shows those methods. Skip any bake step that assumes a Dutch oven.',
        url: null,
        minutes: 10,
        quest: NO_DUTCH,
        weight: 8,
      },
    ],
    path: (quest, label) =>
      branch(quest, label, [
        {
          test: /oven spring|scor/i,
          steps: [
            step('read', 'Read how a score directs oven spring', 'The scoring pages show the cut and what the loaf does with it.'),
            step('read', 'Choose a way to add steam', 'A lid, a pan of water, or a bowl. Use what you have.'),
            step('act', label, 'Score one loaf and notice where it opens. That bake is the quest.'),
          ],
        },
        {
          test: /mix a starter|create a starter|new starter|from scratch/i,
          steps: [
            step('read', 'Read the starter recipe', 'Flour, water, and what the jar should do on the first days.'),
            step('act', label, 'Mix the jar. The page does not start it for you.'),
          ],
        },
        {
          test: /feed|maintain|doubles|ripe starter|healthy starter/i,
          steps: [
            step('read', 'Read the feeding guide', 'Amounts first. Then look at what a healthy jar looks like.'),
            step('checklist', 'Write today’s feed', 'How much you kept, how much flour, how much water, and when you will look again.'),
            step('act', label, 'Feed the jar. Reading the guide does not finish the quest.'),
          ],
        },
        {
          test: NO_DUTCH,
          steps: [
            step('read', 'Pick a steam method that is not a Dutch oven', 'A pan of water or a metal bowl. The steam guide shows both.'),
            step('checklist', 'Write the bake vessel you will actually use', 'If the recipe assumes a Dutch oven, replace that step. Do not buy one for this quest.'),
            step('act', label, 'The quest is a recipe you can bake with the pot you have.'),
          ],
        },
        {
          test: /loaf|dough|bake|recipe/i,
          steps: [
            step('read', 'Read one loaf recipe through', 'The basic sourdough bread recipe. Do not open a second one.'),
            step('checklist', 'Note the shape, the rise, and the pot', 'Tight skin, a slow-springing dent, and a preheated covered pot.'),
            step('act', label, 'Bake the loaf. The quest is the bread, not the tab.'),
          ],
        },
      ]),
  },
  {
    test: /bread|loaf|bak(e|ing)|dough|yeast/i,
    kit: "The Artisan's Tools",
    seeds: [
      {
        key: 'loaf',
        kind: 'watch',
        title: 'The easiest loaf of bread you’ll ever bake',
        source: 'King Arthur Baking',
        why: 'Five ingredients and a video of the knead, the rise, and the bake. The right first loaf when you are using yeast, not a sourdough starter.',
        url: 'https://www.kingarthurbaking.com/recipes/the-easiest-loaf-of-bread-youll-ever-bake-recipe',
        minutes: 15,
        quest: /loaf|bake|recipe|knead|dough/i,
        avoid: /yeast wakes|bloom|activation/i,
        weight: 3,
      },
      {
        key: 'yeast',
        kind: 'checklist',
        title: 'Check that the yeast is alive',
        source: 'Written for this quest',
        why: 'Stir the yeast into warm water (about 105°F) with a pinch of sugar. Wait ten minutes. Foam means it is alive. No foam means start over before you add the flour.',
        url: null,
        minutes: 10,
        quest: /yeast|bloom|activation|wakes/i,
        weight: 4,
      },
      {
        key: 'kit',
        kind: 'checklist',
        title: 'Flour, water, salt, yeast, and a loaf pan or pot',
        source: 'Written for this quest',
        why: 'Those four ingredients and something to bake in are enough for a first loaf. Measure the flour by weight if you have a scale.',
        url: null,
        minutes: 5,
        quest: /ingredient|equipment|gather|loaf|bake|mix the first/i,
      },
    ],
    path: (quest, label) =>
      branch(quest, label, [
        {
          test: /yeast|bloom|activation/i,
          steps: [
            step('checklist', 'Bloom a pinch of yeast', 'Warm water, a pinch of sugar, ten minutes. Foam means it is alive.'),
            step('act', label, 'The quest is that test, not a loaf yet.'),
          ],
        },
        {
          test: /loaf|bake|knead|dough|recipe/i,
          steps: [
            step('watch', 'Watch one loaf from start to finish', 'The King Arthur easiest-loaf page. Stay with that recipe.'),
            step('act', label, 'Mix, knead until it stretches, and bake it.'),
          ],
        },
      ]),
  },
  {
    test: /python|programming|coding|\bcode\b/i,
    kit: "The Engineer's Manual",
    seeds: [
      {
        key: 'intro',
        kind: 'read',
        title: 'Python tutorial: numbers, strings, and variables',
        source: 'Python documentation',
        why: 'The official introduction. This is the page for variables and the kinds of values they hold, not a tour of the whole language.',
        url: 'https://docs.python.org/3/tutorial/introduction.html',
        minutes: 25,
        quest: /variable|string|integer|float|boolean|kinds of value|greeting|asks for a name/i,
        avoid: /\blists?\b|guess|game|loop|while|if and else/i,
        weight: 4,
      },
      {
        key: 'var-practice',
        kind: 'checklist',
        title: 'Four variables, then print them',
        source: 'Written for this quest',
        why: 'In a new file, make one string, one integer, one float, and one boolean. Print each. If Python says you used a word you never assigned, that name is the bug.',
        url: null,
        minutes: 15,
        quest: /variable|string|integer|float|boolean|kinds of value/i,
        avoid: /\blists?\b|guess|game/i,
      },
      {
        key: 'input',
        kind: 'read',
        title: 'input() and print()',
        source: 'Python documentation',
        why: 'The official page for reading a line the player types and printing an answer. A greeting and a guessing game both start here.',
        url: 'https://docs.python.org/3/tutorial/inputoutput.html',
        minutes: 15,
        quest: /input|greeting|asks for a name|guess|game/i,
        avoid: /\blists?\b/i,
        weight: 2,
      },
      {
        key: 'flow',
        kind: 'read',
        title: 'if, while, and for',
        source: 'Python documentation',
        why: 'The official control-flow chapter. A guessing game needs if and while. A counting loop needs for and range(). Stay on the section this quest names.',
        url: 'https://docs.python.org/3/tutorial/controlflow.html',
        minutes: 20,
        quest: /if and else|decision|condition|loop|while|for statement|guess|game|print the numbers/i,
        avoid: /\blists?\b|variable only/i,
        weight: 3,
      },
      {
        key: 'random',
        kind: 'explore',
        title: 'random — picking a secret number',
        source: 'Python documentation',
        why: 'The standard library page for random numbers. A guessing game needs randint. You do not need the rest of the module.',
        url: 'https://docs.python.org/3/library/random.html',
        minutes: 10,
        quest: /guess|random|secret number|game/i,
        weight: 5,
      },
      {
        key: 'game-notes',
        kind: 'checklist',
        title: 'The shape of a number guessing game',
        source: 'Written for this quest',
        why: 'Pick a secret with random.randint. Loop with while. Read a guess with input(), turn it into a number, and print whether it is too high or too low. The game is done when a correct guess ends the loop.',
        url: null,
        minutes: 20,
        quest: /guess|number guessing|guessing game/i,
        weight: 4,
      },
      {
        key: 'lists',
        kind: 'read',
        title: 'Lists: indexing, append, and loops',
        source: 'Python documentation',
        why: 'The official data-structures chapter starts with lists. Indexing, append, remove, and walking a list live here. This is not the variables introduction.',
        url: 'https://docs.python.org/3/tutorial/datastructures.html',
        minutes: 20,
        quest: /\blists?\b|append|indexing/i,
        avoid: /guess|game/i,
        weight: 6,
      },
      {
        key: 'list-practice',
        kind: 'checklist',
        title: 'Five list exercises',
        source: 'Written for this quest',
        why: 'Make a list of three names. Print the first and the last. Append one name. Remove one. Then write a for loop that prints each name on its own line. The list chapter is the reference if a line fails.',
        url: null,
        minutes: 15,
        quest: /\blists?\b|append|indexing/i,
        avoid: /guess|game/i,
      },
      {
        key: 'count',
        kind: 'checklist',
        title: 'A loop that prints 1 through 10',
        source: 'Written for this quest',
        why: 'Write a for loop over range(1, 11) that prints the numbers 1 through 10. Run it. If a number is missing, that loop is the only thing to fix.',
        url: null,
        minutes: 15,
        quest: /counting loop|print the numbers|1 through 10|range\(/i,
        avoid: /guess|\blists?\b/i,
      },
    ],
    path: (quest, label) =>
      branch(quest, label, [
        {
          test: /\blists?\b|append/i,
          steps: [
            step('read', 'Read the list section only', 'Indexing, append, and walking the list. Leave the rest of the chapter.'),
            step('checklist', 'Do the five list exercises', 'First, last, append, remove, then a for loop.'),
            step('act', label, 'The quest is done when those lines run.'),
          ],
        },
        {
          test: /guess|game/i,
          steps: [
            step('explore', 'See how randint picks a number', 'That is the secret. You do not need the rest of random.'),
            step('read', 'Read while and if, and how input() works', 'The control-flow chapter and the input page. Stop after those.'),
            step('checklist', 'Build the game in that order', 'Secret, loop, guess, higher or lower, stop when they are equal.'),
            step('act', label, 'Play it once. A tutorial tab does not finish the quest.'),
          ],
        },
        {
          test: /variable|string|integer|float|boolean/i,
          steps: [
            step('read', 'Read the introduction through variables', 'Numbers and strings. Stop before you wander into later chapters.'),
            step('checklist', 'Make four values and print them', 'One string, one integer, one float, one boolean.'),
            step('act', label, 'The quest is those four lines running.'),
          ],
        },
        {
          test: /loop|while|for |if and else|decision/i,
          steps: [
            step('read', 'Read the control-flow section this quest names', 'if, or for and range(). Not the whole language.'),
            step('act', label, 'Write the small program and run it.'),
          ],
        },
      ]),
  },
  {
    test: /swim/i,
    kit: "The Coach's Notes",
    seeds: [
      {
        key: 'breath',
        kind: 'read',
        title: 'Freestyle breathing, including bilateral sets',
        source: 'U.S. Masters Swimming',
        why: 'How to time the breath with the stroke, plus sets that alternate sides. This is the breathing page, not a flip-turn or fitness plan.',
        url: 'https://www.usms.org/fitness-and-training/guides/freestyle/breathing',
        minutes: 12,
        quest: /breath|bilateral|exhale|inhale/i,
        avoid: /flip|turn|endurance|interval|training plan/i,
        weight: 5,
      },
      {
        key: 'both',
        kind: 'read',
        title: 'Should you breathe to both sides?',
        source: 'U.S. Masters Swimming',
        why: 'Why bilateral breathing balances the stroke, and how to start if you have only ever breathed to one side.',
        url: 'https://www.usms.org/fitness-and-training/articles-and-videos/articles/should-you-breathe-to-both-sides-in-freestyle',
        minutes: 8,
        quest: /breath|bilateral|both sides|one side/i,
        avoid: /flip|turn|endurance|interval|training plan/i,
      },
      {
        key: 'breath-cues',
        kind: 'checklist',
        title: 'Breathing cues: timing, rotation, and the usual mistakes',
        source: 'Written for this quest',
        why: 'Breathe out underwater, then turn the head with the body instead of lifting it. One goggle in the water is enough. The usual mistakes are holding the breath, looking forward, and crossing the arm over the center. Swim four short lengths on one of those cues.',
        url: null,
        minutes: 12,
        quest: /breath|bilateral/i,
        avoid: /flip|turn|endurance|training plan/i,
      },
      {
        key: 'flip-video',
        kind: 'watch',
        title: 'Three steps to a freestyle flip turn',
        source: 'U.S. Masters Swimming',
        why: 'Finish the last strokes with your hands by your hips, somersault tight, plant the feet, and leave in a streamline. A video of those three steps.',
        url: 'https://www.usms.org/fitness-and-training/articles-and-videos/videos/3-steps-to-a-great-freestyle-flip-turn',
        minutes: 8,
        quest: /flip ?turn|tumble|somersault/i,
        avoid: /breath|endurance|interval/i,
        weight: 6,
      },
      {
        key: 'flip-drills',
        kind: 'read',
        title: 'Flip turn drills',
        source: 'U.S. Masters Swimming',
        why: 'Stationary flips, a straight push-off, and adding the approach. Practice the turn in pieces before you swim it at speed.',
        url: 'https://www.usms.org/fitness-and-training/guides/turns/flip-turns/drills',
        minutes: 10,
        quest: /flip ?turn|tumble|push-?off|streamline/i,
        avoid: /breath|endurance|training plan/i,
        weight: 4,
      },
      {
        key: 'flip-notes',
        kind: 'checklist',
        title: 'Approach, streamline, and the usual flip-turn mistakes',
        source: 'Written for this quest',
        why: 'Start the flip about an arm’s length from the wall, not when you touch it. Feet land around a foot under the surface. Leave in a tight streamline and hold the glide. The usual mistakes are a late flip, a loose tuck, and standing up before you push.',
        url: null,
        minutes: 10,
        quest: /flip ?turn|tumble/i,
        avoid: /breath|endurance/i,
      },
      {
        key: 'plans',
        kind: 'explore',
        title: 'Six-week swim plans for swimming farther',
        source: 'U.S. Masters Swimming',
        why: 'Endurance plans built from intervals, with a distance to choose from. This is a training plan, not a technique page about breathing or turns.',
        url: 'https://www.usms.org/fitness-and-training/six-week-swim-training-plans/six-week-swim-training-plan-information',
        minutes: 10,
        quest: /endurance|stamina|swim farther|training plan|interval|workout|volume|distance/i,
        avoid: /breath|flip|turn/i,
        weight: 6,
      },
      {
        key: 'endurance-notes',
        kind: 'checklist',
        title: 'A simple endurance session',
        source: 'Written for this quest',
        why: 'Warm up easy. Then repeat a distance you can hold with even pace — for example 6 × 50m — with enough rest that the next one does not fall apart. Write the distance, the rest, and the total you swam. Add a little volume next time, not a much harder pace.',
        url: null,
        minutes: 15,
        quest: /endurance|stamina|interval|workout|volume|training plan|pace/i,
        avoid: /breath|flip|turn/i,
      },
      {
        key: 'time',
        kind: 'checklist',
        title: 'How to time a 200',
        source: 'Written for this quest',
        why: 'Start the clock when you leave the wall. Swim 200m without stopping if you can. Write the time and one note about where the stroke fell apart. That number is what you compare next time.',
        url: null,
        minutes: 15,
        quest: /timed|time a|pace for a|200m|100m/i,
        avoid: /breath|flip|endurance plan/i,
      },
    ],
    path: (quest, label) =>
      branch(quest, label, [
        {
          test: /flip/i,
          steps: [
            step('watch', 'Watch the three steps', 'Hands to the hips, a tight somersault, a streamlined push.'),
            step('read', 'Practice one drill from the flip-turn page', 'A stationary flip is enough if the whole turn still feels like a heap.'),
            step('act', label, 'Do the turns in the water. The video does not finish the quest.'),
          ],
        },
        {
          test: /endurance|stamina|interval|training plan|volume/i,
          steps: [
            step('explore', 'Choose one plan that matches the distance you can swim now', 'The six-week plans are sorted by how far you are trying to go.'),
            step('checklist', 'Write today’s set before you get in', 'Distance, rest, and the total. Easy pace.'),
            step('act', label, 'Swim the session. The plan does not swim it for you.'),
          ],
        },
        {
          test: /breath/i,
          steps: [
            step('read', 'Take one breathing cue from the guide', 'Timing, or both sides. Not both at once.'),
            step('checklist', 'Swim four short lengths on that cue', 'Rest enough that the breath stays quiet.'),
            step('act', label, 'The quest is the swim, not the article.'),
          ],
        },
        {
          test: /timed|200m|100m|pace/i,
          steps: [
            step('checklist', 'Time the swim this quest names', 'Start the clock as you leave the wall. Write the number before you look at anything else.'),
            step('act', label, 'The quest is the swim and the number.'),
          ],
        },
      ]),
  },
  {
    test: /tokyo|kyoto|osaka|shinkansen|\bjapan\b|japan trip|visit japan/i,
    kit: "The Traveler's Kit",
    seeds: [
      {
        key: 'airports',
        kind: 'read',
        title: 'Getting to Japan — airports and arrival cities',
        source: 'Japan National Tourism Organization',
        why: 'Which airports serve Tokyo, Osaka, and the west, and how long the train is from each one. Read this before you compare fares.',
        url: 'https://www.japan.travel/en/plan/getting-to-japan/',
        minutes: 10,
        quest: /flight|airline|airport|baggage|fly\b|book my flight|plane/i,
        avoid: /itinerary|hotel|neighborhood|shinkansen|rail pass/i,
        weight: 5,
      },
      {
        key: 'flights',
        kind: 'tool',
        title: 'Compare flights by date and stop',
        source: 'Google Flights',
        why: 'Set the dates and the arrival city, then compare stops and airlines. Write down one itinerary you could book, including the airport.',
        url: 'https://www.google.com/travel/flights',
        minutes: 20,
        quest: /flight|airline|airport|book my flight|plane ticket|fly\b/i,
        avoid: /itinerary|hotel|neighborhood|shinkansen|train transportation/i,
        weight: 6,
      },
      {
        key: 'bags',
        kind: 'checklist',
        title: 'Before you book: airport, bags, and one itinerary',
        source: 'Written for this quest',
        why: 'Write the arrival airport, how you will leave it, and whether you are checking a bag. Compare two airlines on the same dates. The quest is one itinerary written down, not an open-ended search.',
        url: null,
        minutes: 15,
        quest: /flight|airline|airport|book my flight|baggage|plane/i,
        avoid: /itinerary|hotel|shinkansen/i,
      },
      {
        key: 'tokyo-areas',
        kind: 'explore',
        title: 'Tokyo neighborhoods and areas',
        source: 'GO TOKYO',
        why: 'The city’s official guide to its areas. Use it to choose where a day happens, before you collect a list of sights.',
        url: 'https://www.gotokyo.org/en/destinations/',
        minutes: 15,
        quest: /tokyo/i,
        avoid: /flight|airport|hotel|where to stay|accommodation|places to stay|shinkansen|rail pass|train transportation/i,
        weight: 5,
      },
      {
        key: 'tokyo-do',
        kind: 'explore',
        title: 'What to see and do in Tokyo',
        source: 'GO TOKYO',
        why: 'The official list of sights and things to do. Pick a short list that shares a neighborhood. A list across the whole city is two days.',
        url: 'https://www.gotokyo.org/en/see-and-do/',
        minutes: 15,
        quest: /tokyo|itinerary|what to see|attraction|sight/i,
        avoid: /flight|airport|hotel|accommodation|places to stay|where to stay|shinkansen|rail pass|kyoto/i,
        weight: 4,
      },
      {
        key: 'tokyo-rail',
        kind: 'read',
        title: 'Getting around Tokyo on JR',
        source: 'GO TOKYO',
        why: 'How JR works inside Tokyo, including passes that only make sense for the city. This is transit between Tokyo sights, not the national rail pass and not the Shinkansen.',
        url: 'https://www.gotokyo.org/en/plan/getting-around/jr-east/index.html',
        minutes: 10,
        quest: /tokyo/i,
        avoid: /flight|airport|hotel|accommodation|where to stay|places to stay|shinkansen|rail pass|kyoto/i,
        weight: 3,
      },
      {
        key: 'rail',
        kind: 'read',
        title: 'Japan Rail Pass — where it works',
        source: 'Japan Rail Pass',
        why: 'The official pass: which Shinkansen it covers, who can buy it, and which trains it does not include. Check your route before you assume the pass pays for it.',
        url: 'https://japanrailpass.net/en/',
        minutes: 12,
        quest: /shinkansen|rail pass|jr pass|train transportation|get around japan|getting around japan|plan the trains|between regions|between cities/i,
        avoid: /flight|airport|itinerary|neighborhood|hotel|places to stay/i,
        weight: 6,
      },
      {
        key: 'ic',
        kind: 'explore',
        title: 'IC cards: Suica, PASMO, and tapping in',
        source: 'GO TOKYO',
        why: 'How a prepaid IC card pays for local trains, subways, and buses, and where that network reaches. It does not replace a Shinkansen ticket.',
        url: 'https://www.gotokyo.org/en/plan/getting-around/ic-card/index.html',
        minutes: 8,
        quest: /ic card|suica|pasmo|train transportation|train system|get around japan|getting around japan|local train|subway|plan the trains/i,
        avoid: /flight|airport|itinerary|neighborhood|hotel|places to stay/i,
        weight: 5,
      },
      {
        key: 'route',
        kind: 'checklist',
        title: 'Plan the route, then choose a pass',
        source: 'Written for this quest',
        why: 'Write each city pair and whether that hop is a local train or a Shinkansen. An IC card covers the local hop. A rail pass is only worth it if the long hops are on trains the pass includes. Apps such as Japan Transit Planner or Navitime can check one route after the list exists.',
        url: null,
        minutes: 15,
        quest: /shinkansen|rail pass|train transportation|get around japan|getting around japan|plan the trains|ic card|suica/i,
        avoid: /flight|itinerary|neighborhood|hotel/i,
      },
      {
        key: 'stay',
        kind: 'explore',
        title: 'Where to stay in Kyoto',
        source: 'Kyoto Travel',
        why: 'Kyoto’s own accommodations page. Choose the neighborhood and the kind of stay — hotel, inn, or guesthouse — before you pick a room.',
        url: 'https://kyoto.travel/en/accommodations/',
        minutes: 12,
        quest: /stay|hotel|hostel|ryokan|accommodation|lodging|neighborhood|guesthouse|where to sleep/i,
        avoid: /flight|shinkansen|itinerary|tokyo/i,
        weight: 6,
      },
      {
        key: 'kyoto-move',
        kind: 'go',
        title: 'Getting around Kyoto',
        source: 'Kyoto Travel',
        why: 'Buses, the subway, and which station to use. A place to stay is only convenient if you can name the station you will walk from.',
        url: 'https://kyoto.travel/en/getting-around/',
        minutes: 10,
        quest: /kyoto/i,
        avoid: /flight|shinkansen|rail pass|tokyo itinerary|book my flight/i,
        weight: 3,
      },
      {
        key: 'kyoto-official',
        kind: 'explore',
        title: 'Kyoto, from the official country guide',
        source: 'Japan National Tourism Organization',
        why: 'The national tourism page for Kyoto: what the city is, before you commit to a neighborhood or a list of temples.',
        url: 'https://www.japan.travel/en/destinations/kansai/kyoto/',
        minutes: 10,
        quest: /kyoto/i,
        avoid: /flight|shinkansen|rail pass|train transportation|tokyo/i,
        weight: 1,
      },
      {
        key: 'map',
        kind: 'tool',
        title: 'Map the places on this quest',
        source: 'Google Maps',
        why: 'Drop in only the places this quest names. For an itinerary, see which sights share a day. For a stay, see which neighborhoods are a short walk from a station.',
        url: 'https://www.google.com/maps',
        minutes: 15,
        quest: /itinerary|neighborhood|where to stay|places to stay|attraction|sight|map the/i,
        avoid: /flight|airport|shinkansen|rail pass|train transportation/i,
        weight: 2,
      },
      {
        key: 'stay-notes',
        kind: 'checklist',
        title: 'Neighborhood, station, then the room',
        source: 'Written for this quest',
        why: 'Write the city, the area you want to wake up in, and the station you will use. Search rooms only after those three lines exist. A hotel next to the wrong station is the wrong hotel.',
        url: null,
        minutes: 12,
        quest: /stay|hotel|accommodation|lodging|neighborhood|ryokan|guesthouse/i,
        avoid: /flight|shinkansen|tokyo itinerary/i,
      },
      {
        key: 'food',
        kind: 'explore',
        title: 'Gastronomy in Japan',
        source: 'Japan National Tourism Organization',
        why: 'Official notes on sushi, ramen, kaiseki, and regional dishes, so the meals you want are tied to a city already on the trip.',
        url: 'https://www.japan.travel/en/gastronomy/',
        minutes: 12,
        quest: /food|meal|eat|ramen|sushi|restaurant|cuisine/i,
        avoid: /flight|hotel|train/i,
      },
      {
        key: 'regions',
        kind: 'explore',
        title: 'Travel Japan — the official country guide',
        source: 'Japan National Tourism Organization',
        why: 'Regions and practical planning. Use this only when the quest is still “which parts of Japan,” not a flight, a city, or a train.',
        url: 'https://www.japan.travel/en/',
        minutes: 20,
        quest: /which regions|which cities|where in japan|plan my japan|choose the regions|overview/i,
        avoid: /flight|hotel|itinerary|shinkansen|kyoto|tokyo/i,
      },
    ],
    path: (quest, label) =>
      branch(quest, label, [
        {
          test: /flight|airline|airport|plane/i,
          steps: [
            step('read', 'See which airport matches your first city', 'Narita, Haneda, and Kansai are not interchangeable.'),
            step('tool', 'Compare one real itinerary', 'Dates you might actually travel. Write down one option, including bags.'),
            step('act', label, 'The quest is that written option.'),
          ],
        },
        {
          test: /shinkansen|rail pass|train transportation|get around|plan the trains|ic card|suica/i,
          steps: [
            step('read', 'Read where the Japan Rail Pass works', 'And where an IC card is the right tool instead.'),
            step('checklist', 'List each hop', 'Local train or Shinkansen. The pass is useless if your trains are not on it.'),
            step('act', label, 'Write the card or pass you will actually use.'),
          ],
        },
        {
          test: /stay|hotel|neighborhood|accommodation|lodging|ryokan/i,
          steps: [
            step('explore', 'Read the city’s own stay page', 'Neighborhood first. Room name second.'),
            step('go', 'Check the station you would walk from', 'Kyoto’s getting-around page if the city is Kyoto.'),
            step('act', label, 'Write the neighborhood, the station, and the kind of stay.'),
          ],
        },
        {
          test: /tokyo|itinerary|what to see/i,
          steps: [
            step('explore', 'Choose areas, then sights', 'GO TOKYO’s neighborhood pages, then the see-and-do list.'),
            step('read', 'See how you will move between them', 'The JR East page is for inside Tokyo.'),
            step('act', label, 'Write a day another person could follow.'),
          ],
        },
        {
          test: /food|meal|ramen|sushi/i,
          steps: [
            step('explore', 'Read the official food guide', 'Pick meals that belong to cities already on your list.'),
            step('act', label, 'Write the meal and the city.'),
          ],
        },
      ]),
  },
  {
    test: /guitar/i,
    kit: "The Musician's Case",
    seeds: [
      {
        key: 'course',
        kind: 'watch',
        title: 'Beginner guitar course, stage 1',
        source: 'JustinGuitar',
        why: 'A free course that starts with how to hold the guitar and the first chords, in order.',
        url: 'https://www.justinguitar.com/beginner',
        minutes: 20,
        quest: /hold|pick|chord|beginner|first/i,
        avoid: /switch|chang|strumming pattern|record/i,
        weight: 2,
      },
      {
        key: 'changes',
        kind: 'watch',
        title: 'One-minute chord changes',
        source: 'JustinGuitar',
        why: 'A timed drill for moving between chords. This is the page for switching, not for learning a new chord.',
        url: 'https://www.justinguitar.com/guitar-lessons/stage-1-one-minute-changes-bc-115',
        minutes: 10,
        quest: /switch|chang|strum/i,
        weight: 4,
      },
      {
        key: 'schedule',
        kind: 'read',
        title: 'Stage 1 practice schedule',
        source: 'JustinGuitar',
        why: 'How to spend a short practice so the chords and the changes both get time.',
        url: 'https://www.justinguitar.com/guitar-lessons/stage-1-practice-schedule-bc-119',
        minutes: 8,
        quest: /practice schedule|routine|how long to practice/i,
      },
    ],
    path: (quest, label) =>
      branch(quest, label, [
        {
          test: /switch|chang|strum/i,
          steps: [
            step('watch', 'Practice the changes on a clock', 'The one-minute changes lesson is the drill.'),
            step('act', label, 'Play it. The video does not count as the practice.'),
          ],
        },
        {
          test: /hold|pick|chord/i,
          steps: [
            step('watch', 'Learn the hold and the chords this quest names', 'Stop when each one rings.'),
            step('act', label, 'Play it. The video does not count as the practice.'),
          ],
        },
      ]),
  },
  {
    test: /\b5\s?k\b|marathon|\brun\b|running|jog/i,
    kit: "The Coach's Notes",
    seeds: [
      {
        key: 'novice',
        kind: 'read',
        title: 'Novice 5K plan, eight weeks',
        source: 'Hal Higdon',
        why: 'Three run-walks a week, ending in a 5K. Use this if you can already jog about a mile and a half.',
        url: 'https://www.halhigdon.com/training-programs/5k-training/novice-5k/',
        minutes: 10,
        quest: /5k|race|practice 5/i,
        weight: 3,
      },
      {
        key: 'start',
        kind: 'read',
        title: 'Beginning runner’s 30/30 plan',
        source: 'Hal Higdon',
        why: 'Jog 30 seconds, walk until you recover, for 30 minutes. The right page if a continuous mile still feels like too much.',
        url: 'https://www.halhigdon.com/training-programs/more-training/beginning-runners-guide/',
        minutes: 8,
        quest: /baseline|begin|walk|easy pace|new runner|continuous|interval|first/i,
        avoid: /5k|race/i,
        weight: 2,
      },
    ],
    path: (_quest, label) => [
      step('read', 'Pick the plan that matches the running you can do today', '30/30 if you are brand new. The novice 5K if a short jog already exists.'),
      step('act', label, 'Do the session. Write how it felt in one line.'),
    ],
  },
  {
    test: /philosoph|stoic|ethics/i,
    kit: "The Scholar's Library",
    seeds: [
      {
        key: 'sep',
        kind: 'read',
        title: 'Stanford Encyclopedia of Philosophy',
        source: 'Stanford Encyclopedia of Philosophy',
        why: 'A maintained reference. Use one entry to check a claim after you have read the pages. It is not a substitute for them.',
        url: 'https://plato.stanford.edu/index.html',
        minutes: 15,
        quest: /claim|argument|agree|disagree|encyclopedia/i,
      },
      {
        key: 'pages',
        kind: 'checklist',
        title: 'Ten pages and the claim in your words',
        source: 'Written for this quest',
        why: 'Read the pages this quest names. Write the author’s claim in two or three sentences of your own. If you need their sentence, you do not have it yet.',
        url: null,
        minutes: 30,
        quest: /read|page|claim|book|text|argument/i,
        weight: 2,
      },
    ],
    path: (quest, label) =>
      branch(quest, label, [
        {
          test: /page|read|claim|book|text|argument|agree/i,
          steps: [
            step('checklist', 'Read the pages this quest names', 'A shelf is not a quest. One argument is.'),
            step('act', label, 'Write the claim, or the disagreement, in your own sentences.'),
          ],
        },
      ]),
  },
]

function questText(query: SupplyQuery): string {
  return `${query.questLabel} ${query.questDescription}`.replace(/\s+/g, ' ').trim()
}

function contextText(query: SupplyQuery): string {
  return `${query.idea} ${query.kingdomName} ${query.kingdomDescription} ${query.category} ${query.questLabel} ${query.questDescription}`
}

function scoreSeed(seed: Seed, query: SupplyQuery, used: Set<string>): number {
  const quest = questText(query)
  if (!quest || seed.avoid?.test(quest)) return 0
  if (!seed.quest.test(quest)) return 0
  const span = quest.match(seed.quest)?.[0].length ?? 0
  let score = 10 + Math.min(18, span) + (seed.weight ?? 0)
  if (seed.quest.test(query.questLabel)) score += 6
  if (seed.url) score += 2
  if (query.minutes && query.minutes <= 20 && seed.minutes && seed.minutes <= 12) score += 1
  if (query.priority === 'high' && seed.minutes && seed.minutes <= 15) score += 1
  if (seed.url && used.has(seed.url)) score -= 5
  return score
}

function chooseSeeds(pack: Pack, query: SupplyQuery): Seed[] {
  const used = new Set(query.usedUrls.filter(Boolean))
  const ranked = pack.seeds
    .map((seed) => ({ seed, score: scoreSeed(seed, query, used) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.seed.title.localeCompare(b.seed.title))

  const picked: Seed[] = []
  for (const item of ranked) {
    if (picked.length >= 5) break
    if (item.seed.url && picked.some((seed) => seed.url === item.seed.url)) continue
    picked.push(item.seed)
  }
  return picked
}

function covers(seeds: Seed[], constraints: string[]): boolean {
  const blob = seeds.map((seed) => `${seed.title} ${seed.why}`).join(' ').toLowerCase()
  return constraints.every((item) => blob.includes(item.toLowerCase().slice(0, 18)))
}

function constraintSeed(label: string, constraints: string[]): Seed {
  return {
    key: 'limits',
    kind: 'checklist',
    title: constraints.length > 1 ? 'The limits you wrote into this quest' : `Keep this limit: ${clip(constraints[0], 52)}`,
    source: 'Written for this quest',
    why: `“${label}” only counts if you honor ${constraints.join('; ')}. Set aside any guide that ignores that.`,
    url: null,
    minutes: 8,
    quest: /$^/,
  }
}

function padSeeds(query: SupplyQuery): Seed[] {
  const label = query.questLabel.trim() || 'this quest'
  const detail = query.questDescription.trim()
  const constraints = findConstraints(questText(query))
  const limit = constraints.length ? ` Keep this limit in view: ${constraints.join('; ')}.` : ''
  const picture = detail ? ` ${detail}` : ''
  return [
    {
      key: 'exact',
      kind: 'checklist',
      title: 'The task, as you wrote it',
      source: 'Written for this quest',
      why: `You asked to ${lowerFirst(label)}.${picture}${limit} A general guide to the whole kingdom is not this quest.`,
      url: null,
      minutes: 10,
      quest: /$^/,
    },
    {
      key: 'first-step',
      kind: 'checklist',
      title: `The first useful step toward “${clip(label, 42)}”`,
      source: 'Written for this quest',
      why: `Do the smallest piece of “${label}” that can be finished in one sitting, and write down what you produced.${limit}`,
      url: null,
      minutes: 10,
      quest: /$^/,
    },
    {
      key: 'done',
      kind: 'checklist',
      title: 'What “done” looks like',
      source: 'Written for this quest',
      why: `“${label}” is finished when you can point at the result, not when a tab is closed.${limit}`,
      url: null,
      minutes: 5,
      quest: /$^/,
    },
  ]
}

function toResource(seed: Seed): QuestResource {
  return {
    id: crypto.randomUUID(),
    kind: seed.kind,
    title: seed.title,
    source: seed.source,
    why: seed.why,
    url: seed.url,
    minutes: seed.minutes,
    saved: false,
    viewed: false,
  }
}

/** Stable text for “has this quest changed since we chose guides?” */
export function supplyFingerprint(label: string, description: string, mode: 'ai' | 'shelf' = 'shelf'): string {
  return `${mode}\n${label.trim()}\n${description.trim()}`
}

/** Keep viewed and bookmarked state when the same guide is chosen again. */
export function withRememberedState(previous: QuestResource[], next: QuestResource[]): QuestResource[] {
  return next.map((resource) => {
    const old = previous.find((item) => item.title === resource.title && item.url === resource.url)
    if (!old) return resource
    return { ...resource, id: old.id, viewed: old.viewed, saved: old.saved }
  })
}

function fallback(query: SupplyQuery): { resources: QuestResource[]; startPath: StartStep[] } {
  const quest = questText(query)
  const label = query.questLabel.trim() || 'this quest'
  return {
    resources: padSeeds(query).slice(0, 3).map(toResource),
    startPath: exactPath(label, quest),
  }
}

export function kitTitle(query: SupplyQuery): string {
  const pack = PACKS.find((entry) => entry.test.test(contextText(query)))
  if (pack) return pack.kit
  if (/travel|trip|visit/i.test(contextText(query))) return "The Traveler's Kit"
  if (/write|novel|poem/i.test(contextText(query))) return "The Scribe's Library"
  return "The Scribe's Supplies"
}

/**
 * A small set of aids for this exact quest.
 * Kingdom text picks the catalog. Quest text picks the items.
 */
export function curateSupplies(query: SupplyQuery): { resources: QuestResource[]; startPath: StartStep[] } {
  const quest = questText(query)
  const label = query.questLabel.trim() || 'Do the quest'
  const pack = PACKS.find((entry) => entry.test.test(contextText(query)))
  if (!pack) return fallback(query)

  let seeds = chooseSeeds(pack, query)
  const constraints = findConstraints(quest)
  if (constraints.length && !covers(seeds, constraints)) {
    const note = constraintSeed(label, constraints)
    seeds = seeds.length === 0 ? [note] : [seeds[0], note, ...seeds.slice(1)]
    seeds = seeds.slice(0, 5)
  }
  if (seeds.length < 3) {
    const extras = padSeeds(query).filter((seed) => !seeds.some((picked) => picked.title === seed.title))
    seeds = [...seeds, ...extras].slice(0, 4)
  }

  if (seeds.length === 0) return fallback(query)
  return {
    resources: seeds.slice(0, 5).map(toResource),
    startPath: seeds.some((seed) => seed.url) ? pack.path(quest, label) : exactPath(label, quest),
  }
}

export function kindRank(kind: ResourceKind): number {
  return KIND_ORDER.indexOf(kind)
}
