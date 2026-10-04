/**
 * Turn one sentence into a kingdom name, a short description, and a drawing.
 * The original sentence is kept separately so the fantasy name never hides it.
 */

import type { Motif } from './types.ts'

export type ChartedIdea = {
  generatedName: string
  description: string
  category: string
  motif: Motif
}

type Rule = {
  test: RegExp
  category: string
  motif: Motif
  name: string | ((topic: string) => string)
  description: string | ((topic: string) => string)
}

const LANGUAGES = [
  'japanese',
  'spanish',
  'french',
  'german',
  'korean',
  'mandarin',
  'chinese',
  'italian',
  'portuguese',
  'arabic',
  'hindi',
  'latin',
  'greek',
  'russian',
  'swahili',
]

/** More specific rules come first. "Bake bread" must win before a generic "learn". */
const RULES: Rule[] = [
  {
    test: /tokyo|kyoto|osaka|shinkansen|\bjapan trip\b|trip to japan|visit japan|travel to japan|plan a japan/i,
    category: 'travel',
    motif: 'road',
    name: 'The Lantern Road',
    description: 'A road of stations and inns, drawn for a journey to Japan.',
  },
  {
    test: /bread|sourdough|loaf|bak(e|ing)|pastry|dough/i,
    category: 'baking',
    motif: 'hearth',
    name: "The Baker's Hearth",
    description: 'An old stone village where the art of breadmaking is practiced.',
  },
  {
    test: /python/i,
    category: 'code',
    motif: 'clockwork',
    name: 'The Python Forge',
    description: 'A clockwork shop where small programs are hammered into shape.',
  },
  {
    test: /javascript|typescript|\bcoding\b|\bcode\b|programming|software|react\b|algorithm/i,
    category: 'code',
    motif: 'clockwork',
    name: (topic) => (topic && !/code|program/i.test(topic) ? `The ${topic} Forge` : 'The Clockwork Workshop'),
    description: 'Gears, ink, and half-built ideas waiting for a first working version.',
  },
  {
    test: /guitar/i,
    category: 'music',
    motif: 'bard',
    name: "The Bard's Hall",
    description: 'A timber hall where strings stay warm from being played.',
  },
  {
    test: /piano|violin|ukulele|drum|flute|singing|\bsing\b|\bmusic\b|song/i,
    category: 'music',
    motif: 'bard',
    name: (topic) => {
      if (/music|song|sing/i.test(topic)) return "The Bard's Hall"
      return `The ${topic} Hall`
    },
    description: (topic) => `Cottages that practice ${topic.toLowerCase()} with the windows open.`,
  },
  {
    test: /swim/i,
    category: 'sport',
    motif: 'water',
    name: 'The River Pavilion',
    description: 'A riverside training hall, with a quiet dock and a lane of clear water.',
  },
  {
    test: /\b5\s?k\b|marathon|running|\brun\b|jog/i,
    category: 'endurance',
    motif: 'road',
    name: "The Runner's Road",
    description: 'A measured road through the hills, marked for people who are still training.',
  },
  {
    test: /workout|fitness|gym|yoga|lifting|swim|cycling|exercise/i,
    category: 'endurance',
    motif: 'road',
    name: (topic) => `The ${topic} Yard`,
    description: (topic) => `A packed-dirt yard set aside for ${topic.toLowerCase()}.`,
  },
  {
    test: /photograph|camera|\bphoto\b/i,
    category: 'image',
    motif: 'lens',
    name: 'The Lenskeep',
    description: 'An observatory of brass and glass, aimed at ordinary light.',
  },
  {
    test: /garden|plant|orchard|grow vegetables|compost/i,
    category: 'garden',
    motif: 'grove',
    name: 'The Verdant Grove',
    description: 'A walled garden where new beds are still marked with string.',
  },
  {
    test: /novel|fiction|short story|screenplay|creative writing|\bwrite\b|writing|poetry|poem/i,
    category: 'writing',
    motif: 'keep',
    name: (topic) => (/poet|poem/i.test(topic) ? "The Poet's Keep" : "The Storyteller's Keep"),
    description: 'A quiet keep with a desk facing the road, and a story that wants out.',
  },
  {
    test: /film|movie|cinema|documentary/i,
    category: 'performance',
    motif: 'stage',
    name: 'The Lantern Theatre',
    description: 'A small stage, a curtain, and a story told in pictures.',
  },
  {
    test: /philosoph|stoic|ethics/i,
    category: 'thought',
    motif: 'spire',
    name: 'The Questioning Spire',
    description: 'A narrow tower for questions that do not fit on a list.',
  },
  {
    test: /\bread\b|reading|\bbook\b|literature|history/i,
    category: 'reading',
    motif: 'library',
    name: (topic) => `The ${topic} Archive`,
    description: (topic) => `Stone shelves gathered around ${topic.toLowerCase()}.`,
  },
  {
    test: /draw|sketch|paint|illustration|art\b/i,
    category: 'making',
    motif: 'atelier',
    name: 'The Charcoal Atelier',
    description: 'A north-facing room where the light stays even all afternoon.',
  },
  {
    test: /hik(e|ing)|trail|camp|outdoors|outdoor|forest|meditat/i,
    category: 'garden',
    motif: 'grove',
    name: (topic) => `The ${topic} Wild`,
    description: (topic) => `An old wood large enough to practice ${topic.toLowerCase()} in.`,
  },
]

export function topicFrom(idea: string): string {
  let topic = idea.trim().replace(/[.!?]+$/g, '')
  for (let pass = 0; pass < 3; pass++) {
    topic = topic.replace(/^(i want to|i'd like to|i wanna|let's|lets)\s+/i, '')
    topic = topic.replace(/^(get better at|become better at|work on|improve|improving)\s+/i, '')
    topic = topic.replace(
      /^(learn|start|practice|study|train for|train|read|run|make|build|write|try|explore|finish|complete|how to)\s+/i,
      '',
    )
    topic = topic.replace(/^(how to|more|a|an|the|some|to|my|for)\s+/i, '')
  }
  topic = topic.trim()
  if (!topic) topic = idea.trim()
  if (topic.length > 42) topic = `${topic.slice(0, 40).trim()}…`
  return topic
}

export function titleCase(value: string): string {
  if (value !== value.toLowerCase()) return value
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
}

function languageIn(idea: string): string | null {
  const found = LANGUAGES.find((language) => new RegExp(`\\b${language}\\b`, 'i').test(idea))
  return found ? titleCase(found) : null
}

function apply(rule: Rule, topic: string): ChartedIdea {
  const generatedName = typeof rule.name === 'function' ? rule.name(topic) : rule.name
  const description = typeof rule.description === 'function' ? rule.description(topic) : rule.description
  return { generatedName, description, category: rule.category, motif: rule.motif }
}

/** Read an idea and name the land it becomes. */
export function chartIdea(idea: string): ChartedIdea {
  const text = idea.trim()
  const topic = titleCase(topicFrom(text))
  const language = languageIn(text)
  if (language && /learn|speak|study|language|practice/i.test(text)) {
    const eastern = /japanese|korean|chinese|mandarin/i.test(language)
    return {
      generatedName: eastern && /japanese/i.test(language) ? 'The Eastern Language Shrine' : `The ${language} Shrine`,
      description: `A gate where ${language} is allowed to sound strange at first.`,
      category: 'language',
      motif: 'shrine',
    }
  }

  for (const rule of RULES) {
    if (rule.test.test(text)) return apply(rule, topic)
  }

  const noun = ['Hold', 'Hollow', 'Crossing', 'Watch', 'Yard'][text.length % 5]
  return {
    generatedName: `The ${topic} ${noun}`,
    description: `A land drawn from what you wrote, still waiting for its first quest.`,
    category: 'other',
    motif: 'mill',
  }
}
