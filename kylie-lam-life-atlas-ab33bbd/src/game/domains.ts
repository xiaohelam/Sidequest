/**
 * Concrete quests for real activities.
 * Each one is something a person can do, in an order that builds.
 */

export type Stage = 'Foundation' | 'Practice' | 'Application' | 'Challenge' | 'Reflection'

export type QuestSeed = {
  title: string
  action: string
  why: string
  stage: Stage
  /** 1 easy, 2 steady, 3 demanding. */
  difficulty: 1 | 2 | 3
  minutes: number
  focuses?: string[]
}

export type Domain = {
  test: RegExp
  kind: string
  seeds: QuestSeed[]
}

const swim: QuestSeed[] = [
  { title: 'Streamline and push off', action: 'Practice streamline position and push-offs for 10 minutes.', why: 'A long glide is where an efficient stroke begins.', stage: 'Foundation', difficulty: 1, minutes: 10, focuses: ['technique'] },
  { title: 'Relaxed breathing lengths', action: 'Swim 4 × 25m focusing on relaxed breathing.', why: 'Breath that stays calm keeps the rest of the stroke from tightening.', stage: 'Foundation', difficulty: 1, minutes: 15, focuses: ['technique', 'confidence'] },
  { title: 'Bilateral breathing', action: 'Practice bilateral breathing for 10 minutes.', why: 'Breathing to both sides balances the stroke and stops your head locking to one side.', stage: 'Practice', difficulty: 2, minutes: 15, focuses: ['technique'] },
  { title: 'Body-position lengths', action: 'Swim 4 × 50m at an easy pace while focusing on body position.', why: 'An easy pace lets you hold a long line instead of fighting for speed.', stage: 'Practice', difficulty: 2, minutes: 20, focuses: ['technique', 'endurance'] },
  { title: 'A technique session', action: 'Complete a short technique-focused swim session.', why: 'A whole session on one cue is how a drill becomes part of your normal stroke.', stage: 'Application', difficulty: 2, minutes: 30, focuses: ['technique'] },
  { title: 'Hold it for 200m', action: 'Swim 200m while maintaining the body position you just practiced.', why: 'Distance is where a new position either holds or falls apart.', stage: 'Application', difficulty: 2, minutes: 25, focuses: ['technique', 'endurance'] },
  { title: 'Timed 200m', action: 'Complete a timed 200m swim.', why: 'A number gives the next session something honest to compare.', stage: 'Challenge', difficulty: 3, minutes: 20, focuses: ['speed'] },
  { title: 'Track a 200m pace', action: 'Track your pace for a 200m swim.', why: 'Pace shows whether the technique is costing speed or giving it back.', stage: 'Reflection', difficulty: 2, minutes: 15, focuses: ['speed'] },
  { title: 'One outside cue', action: 'Ask a coach or experienced swimmer to name one technique to improve.', why: 'Another pair of eyes sees the habit you can no longer feel.', stage: 'Reflection', difficulty: 1, minutes: 15, focuses: ['technique'] },
  { title: 'Compare your 100m', action: 'Compare your 100m pace with your previous attempt.', why: 'The comparison tells you whether the work changed anything.', stage: 'Reflection', difficulty: 2, minutes: 15, focuses: ['speed'] },
]

const sourdough: QuestSeed[] = [
  { title: 'Mix a starter', action: 'Mix equal weights of flour and water, cover the jar, and leave it overnight.', why: 'A starter is the thing that will raise the loaf. It begins as flour and water.', stage: 'Foundation', difficulty: 1, minutes: 15 },
  { title: 'Feed until it doubles', action: 'Feed the starter on a regular schedule until it reliably doubles in several hours.', why: 'A sleepy starter is the usual reason a first loaf stays flat.', stage: 'Practice', difficulty: 2, minutes: 15 },
  { title: 'Mix the first dough', action: 'Mix one loaf: ripe starter, flour, water, and salt. No second recipe.', why: 'One dough teaches you what ripe starter actually feels like.', stage: 'Application', difficulty: 2, minutes: 40 },
  { title: 'Bake the first loaf', action: 'Shape, proof, and bake that dough into your first sourdough loaf.', why: 'The quest is the loaf, not another article about loaves.', stage: 'Challenge', difficulty: 3, minutes: 60 },
  { title: 'What the loaf did', action: 'Write what happened to the rise, the crumb, and the crust, and name one change for next time.', why: 'The next bake should answer that note.', stage: 'Reflection', difficulty: 1, minutes: 10 },
]

const japan: QuestSeed[] = [
  { title: 'Choose the regions', action: 'Pick two or three regions in Japan and write one sentence on why each is on the list.', why: 'A short list is a trip. A long list is still research.', stage: 'Foundation', difficulty: 1, minutes: 30 },
  { title: 'Plan the flights', action: 'Compare flights into the city you will arrive in, and write down one option you could book.', why: 'One real option is further along than a folder of tabs.', stage: 'Practice', difficulty: 2, minutes: 40 },
  { title: 'Find a place to stay', action: 'Choose the neighborhood for your first nights, and the kind of stay you want there.', why: 'The neighborhood decides the mornings. The hotel name can wait until that is chosen.', stage: 'Practice', difficulty: 2, minutes: 30 },
  { title: 'Plan the trains', action: 'Work out how you will travel between those regions, including whether a rail pass fits the route.', why: 'The pass is only useful if the route is already known.', stage: 'Application', difficulty: 2, minutes: 40 },
  { title: 'Choose the meals', action: 'Name three meals or food experiences you want, and the city each one belongs to.', why: 'Food plans the days as much as temples do.', stage: 'Application', difficulty: 1, minutes: 20 },
  { title: 'Choose the places', action: 'In one city, pick a short list of places to visit and how you will get to each.', why: 'A city becomes walkable once the list is short enough for a day.', stage: 'Challenge', difficulty: 2, minutes: 30 },
  { title: 'Build the days', action: 'Draft a day-by-day outline another person could follow without opening a new tab.', why: 'The outline is the trip. Everything before it was preparation.', stage: 'Reflection', difficulty: 2, minutes: 45 },
]

const bread: QuestSeed[] = [
  { title: 'Choose a simple loaf', action: 'Choose one simple beginner bread recipe and read it all the way through.', why: 'One loaf, understood, is better than five recipes half-remembered.', stage: 'Foundation', difficulty: 1, minutes: 15 },
  { title: 'How yeast wakes up', action: 'Learn how yeast activation works, then bloom a pinch in warm water.', why: 'You can see whether the yeast is alive before it is buried in flour.', stage: 'Foundation', difficulty: 1, minutes: 15, focuses: ['technique'] },
  { title: 'Mix the first dough', action: 'Measure and mix your first dough.', why: 'The feel of a shaggy dough is the real start of baking.', stage: 'Practice', difficulty: 2, minutes: 20 },
  { title: 'Knead until it stretches', action: 'Practice kneading until the dough becomes elastic.', why: 'Elasticity is the sign the dough can hold the gas that lifts the loaf.', stage: 'Practice', difficulty: 2, minutes: 20, focuses: ['technique'] },
  { title: 'Bake the first loaf', action: 'Bake your first loaf and let it cool before you cut it.', why: 'A finished loaf, even an imperfect one, teaches more than another unread recipe.', stage: 'Application', difficulty: 2, minutes: 60 },
  { title: 'Notes for the next loaf', action: 'Record what you would change in the next loaf.', why: 'The next bake should answer one specific problem, not start from scratch.', stage: 'Reflection', difficulty: 1, minutes: 10 },
  { title: 'Same recipe, one change', action: 'Bake the same recipe again and change only one thing, such as water or time.', why: 'One change tells you what that change actually did.', stage: 'Challenge', difficulty: 3, minutes: 60 },
]

const python: QuestSeed[] = [
  { title: 'A greeting program', action: 'Write a program that asks for a name and answers with a greeting.', why: 'Input and output are the first loop you will use in every later program.', stage: 'Foundation', difficulty: 1, minutes: 20 },
  { title: 'Four kinds of value', action: 'Practice variables by making one string, one integer, one float, and one boolean, then print each.', why: 'Most bugs at the start are a value of the wrong kind.', stage: 'Foundation', difficulty: 1, minutes: 20 },
  { title: 'Three small decisions', action: 'Write three short programs that each use if and else.', why: 'Decisions are how a program stops being a straight list of lines.', stage: 'Practice', difficulty: 2, minutes: 30 },
  { title: 'A counting loop', action: 'Use a loop to print the numbers 1 through 10.', why: 'A loop is the tool you will reach for whenever work repeats.', stage: 'Practice', difficulty: 2, minutes: 15 },
  { title: 'Number guessing game', action: 'Build a number guessing game that tells the player higher or lower.', why: 'It combines input, decisions, and a loop in one thing you can actually play.', stage: 'Application', difficulty: 2, minutes: 40 },
  { title: 'A tiny project', action: 'Build a small project that combines variables, decisions, and loops.', why: 'A project you can run tomorrow is the proof the pieces fit together.', stage: 'Challenge', difficulty: 3, minutes: 60 },
  { title: 'What broke', action: 'Run the project, fix one bug, and write one sentence about how you found it.', why: 'Finding a bug is a skill, separate from writing the first version.', stage: 'Reflection', difficulty: 2, minutes: 20 },
]

const run: QuestSeed[] = [
  { title: 'A baseline mile', action: 'Complete a baseline 1-mile run or run/walk, and note the time.', why: 'A starting number makes later progress visible.', stage: 'Foundation', difficulty: 1, minutes: 20, focuses: ['endurance'] },
  { title: 'An easy pace', action: 'Establish a comfortable easy-run pace you could still talk through.', why: 'Most of the training that builds a 5K happens at a pace that feels almost too easy.', stage: 'Foundation', difficulty: 1, minutes: 20, focuses: ['endurance', 'confidence'] },
  { title: 'Twenty continuous minutes', action: 'Run continuously for 20 minutes, walking only if you must.', why: 'Time on your feet matters more, at this stage, than speed.', stage: 'Practice', difficulty: 2, minutes: 25, focuses: ['endurance'] },
  { title: 'A first interval set', action: 'Complete your first short interval workout: 6 × 1 minute a little quicker, with a walk between.', why: 'Short quicker pieces teach pace without asking for a whole fast run.', stage: 'Practice', difficulty: 2, minutes: 25, focuses: ['speed'] },
  { title: 'Three easy miles', action: 'Complete a 3-mile easy run.', why: 'Three miles is most of the distance, done at the pace you can repeat.', stage: 'Application', difficulty: 2, minutes: 40, focuses: ['endurance'] },
  { title: 'A practice 5K', action: 'Complete a practice 5K at a pace where you can still speak in sentences.', why: 'Finishing the distance once changes it from an idea into a route you know.', stage: 'Challenge', difficulty: 3, minutes: 45, focuses: ['endurance', 'speed'] },
  { title: 'Compare the mile', action: 'Repeat the 1-mile baseline and compare the time and how it felt.', why: 'Feeling and the clock together tell you whether the weeks of easy running worked.', stage: 'Reflection', difficulty: 2, minutes: 20, focuses: ['speed'] },
]

const guitar: QuestSeed[] = [
  { title: 'Hold and pick', action: 'Learn how to hold the guitar and how to hold the pick.', why: 'A tense hand makes every later chord harder than it needs to be.', stage: 'Foundation', difficulty: 1, minutes: 15, focuses: ['technique'] },
  { title: 'Three chords', action: 'Learn three basic chords, such as G, C, and D, until each one rings.', why: 'Three chords are already enough for a large number of songs.', stage: 'Foundation', difficulty: 1, minutes: 20, focuses: ['technique'] },
  { title: 'Change without looking away', action: 'Practice switching between those chords for 10 minutes.', why: 'Songs fail at the change, not at the chord you can already hold.', stage: 'Practice', difficulty: 2, minutes: 15, focuses: ['technique'] },
  { title: 'One strumming pattern', action: 'Learn one simple strumming pattern and play it for a whole minute.', why: 'Rhythm is what makes the chords sound like music.', stage: 'Practice', difficulty: 2, minutes: 15 },
  { title: 'Play through a song', action: 'Play a simple song that uses those chords, from the start to the end.', why: 'Finishing a song, slowly, is different from practicing the pieces.', stage: 'Application', difficulty: 2, minutes: 20 },
  { title: 'Changes without stopping', action: 'Practice changing chords without stopping the strum.', why: 'The silence between chords is what a listener hears first.', stage: 'Challenge', difficulty: 3, minutes: 15, focuses: ['technique'] },
  { title: 'Listen back', action: 'Record one take and note the change where your hand gets lost.', why: 'That one change is the next ten minutes of practice.', stage: 'Reflection', difficulty: 1, minutes: 10 },
]

const philosophy: QuestSeed[] = [
  { title: 'One text', action: 'Choose one philosophy book or one short primary text, not a whole shelf.', why: 'A single argument can be finished. A shelf cannot.', stage: 'Foundation', difficulty: 1, minutes: 15 },
  { title: 'Ten pages', action: 'Read 10 pages of that text.', why: 'Ten pages is enough to meet the claim without pretending you have mastered the book.', stage: 'Practice', difficulty: 1, minutes: 30 },
  { title: 'The claim, in your words', action: 'Write down the author’s main claim in a few sentences of your own.', why: 'If you need the book’s sentence, you do not have the claim yet.', stage: 'Application', difficulty: 2, minutes: 20 },
  { title: 'Agree or disagree', action: 'Identify one argument you agree with or one you disagree with, and say why.', why: 'A reason turns reading into thinking.', stage: 'Application', difficulty: 2, minutes: 20 },
  { title: 'Say it to someone', action: 'Explain that argument to another person without the book in your hand.', why: 'Speaking it shows which part you only thought you understood.', stage: 'Challenge', difficulty: 2, minutes: 20 },
  { title: 'What shifted', action: 'Write a short reflection on what, if anything, changed in your thinking.', why: 'The point of the reading is the change, not the pages.', stage: 'Reflection', difficulty: 1, minutes: 15 },
]

const photo: QuestSeed[] = [
  { title: 'Three controls', action: 'Learn what aperture, shutter speed, and ISO each change, and write one sentence for each.', why: 'Those three are the whole exposure. Everything else is a choice on top of them.', stage: 'Foundation', difficulty: 1, minutes: 20, focuses: ['technique'] },
  { title: 'Twenty frames, one subject', action: 'Make 20 photographs of one subject in different light.', why: 'Changing only the light teaches you to see it.', stage: 'Practice', difficulty: 2, minutes: 30 },
  { title: 'Why these three', action: 'Pick the best three frames and write why each one works.', why: 'Naming the reason is how taste becomes a decision you can repeat.', stage: 'Application', difficulty: 2, minutes: 15 },
  { title: 'One deliberate technique', action: 'Go out to use one technique on purpose, such as leading lines or a close portrait.', why: 'Choosing the technique before you leave stops the walk from becoming random snapshots.', stage: 'Challenge', difficulty: 2, minutes: 40 },
  { title: 'Original beside the edit', action: 'Edit one photograph and keep the original beside it.', why: 'The pair shows what the edit actually changed.', stage: 'Reflection', difficulty: 1, minutes: 20 },
]

const garden: QuestSeed[] = [
  { title: 'A plant that fits the light', action: 'Choose one plant that can grow in the light you actually have.', why: 'A windowsill and a yard are different gardens.', stage: 'Foundation', difficulty: 1, minutes: 15 },
  { title: 'What it needs', action: 'Write down the soil, the pot or bed, and how often that plant wants water.', why: 'The list is short on purpose. It is the care you will actually do.', stage: 'Foundation', difficulty: 1, minutes: 15 },
  { title: 'Plant it', action: 'Put the plant in soil.', why: 'The quest ends when it is planted, not when it blooms.', stage: 'Practice', difficulty: 2, minutes: 30 },
  { title: 'Three check-ins', action: 'Look at it on three different days and note soil, leaves, and water.', why: 'Change is easier to see across days than in one anxious glance.', stage: 'Application', difficulty: 1, minutes: 10 },
  { title: 'One problem, in advance', action: 'Learn the signs of one problem — too much water, too little light, or a pest — before it appears.', why: 'You will recognize it faster if you have already named it.', stage: 'Challenge', difficulty: 2, minutes: 20 },
]

const writing: QuestSeed[] = [
  { title: 'Who wants what', action: 'Write one paragraph: who wants something, and what stops them.', why: 'A story starts when a want meets an obstacle.', stage: 'Foundation', difficulty: 1, minutes: 20 },
  { title: 'Where the first page is', action: 'Name the point of view and the place where the first scene happens.', why: 'Those two choices stop the opening from wandering.', stage: 'Foundation', difficulty: 1, minutes: 15 },
  { title: 'The first scene', action: 'Write the first scene, even if it is only about 400 words.', why: 'A finished scene is more useful than an outline of a book you have not started.', stage: 'Practice', difficulty: 2, minutes: 45 },
  { title: 'The next three scenes', action: 'Outline the next three scenes in one sentence each: what changes by the end.', why: 'You only need enough road to write the next page.', stage: 'Application', difficulty: 2, minutes: 20 },
  { title: 'One revision', action: 'Revise the first scene for one clear change.', why: 'One deliberate change teaches revision. A full rewrite mostly teaches doubt.', stage: 'Challenge', difficulty: 2, minutes: 30 },
  { title: 'Read it aloud', action: 'Read the scene aloud and mark the sentence where you stumble.', why: 'Your ear finds the sentence your eyes have started to skip.', stage: 'Reflection', difficulty: 1, minutes: 15 },
]

const language: QuestSeed[] = [
  { title: 'Twenty useful words', action: 'Learn 20 words you would actually say this week, and say each one aloud.', why: 'Words from your own week are the ones you will remember.', stage: 'Foundation', difficulty: 1, minutes: 20 },
  { title: 'The sounds you stumble on', action: 'Practice the letters or sounds you still cannot say cleanly.', why: 'A few sounds, repeated, change more than a long silent vocabulary list.', stage: 'Foundation', difficulty: 1, minutes: 15, focuses: ['technique'] },
  { title: 'One introduction', action: 'Memorize one sentence that introduces you, and say it without looking.', why: 'A sentence you own is the start of a conversation.', stage: 'Practice', difficulty: 2, minutes: 15 },
  { title: 'Five lines', action: 'Have a five-line exchange: question, answer, question, answer, goodbye.', why: 'An exchange is the unit of real use, even if it is with a recording.', stage: 'Application', difficulty: 2, minutes: 15 },
  { title: 'Use one phrase for real', action: 'Use one phrase in a real message or a real conversation.', why: 'Sending it is a different skill from recognizing it on a page.', stage: 'Challenge', difficulty: 2, minutes: 10, focuses: ['confidence'] },
]

export const DOMAINS: Domain[] = [
  { test: /swim/i, kind: 'sport', seeds: swim },
  { test: /tokyo|kyoto|osaka|shinkansen|\bjapan trip\b|trip to japan|visit japan|travel to japan|plan a japan/i, kind: 'travel', seeds: japan },
  { test: /sourdough|starter/i, kind: 'creative-skill', seeds: sourdough },
  { test: /bread|loaf|bak(e|ing)|pastry|dough/i, kind: 'creative-skill', seeds: bread },
  { test: /python/i, kind: 'learning', seeds: python },
  { test: /javascript|typescript|\bcode\b|coding|programming|software/i, kind: 'learning', seeds: python.map((seed) => ({ ...seed, action: seed.action.replace(/program/gi, 'program'), title: seed.title })) },
  { test: /\b5\s?k\b|marathon|\brun\b|running|jog/i, kind: 'sport', seeds: run },
  { test: /guitar/i, kind: 'creative-skill', seeds: guitar },
  { test: /philosoph|stoic/i, kind: 'academic', seeds: philosophy },
  { test: /photograph|camera|\bphoto\b/i, kind: 'creative-skill', seeds: photo },
  { test: /garden|plant|orchard/i, kind: 'hobby', seeds: garden },
  { test: /novel|fiction|short story|\bwrite\b|writing|poetry|poem|screenplay/i, kind: 'creative-project', seeds: writing },
  { test: /japanese|spanish|french|german|korean|chinese|mandarin|italian|portuguese|arabic/i, kind: 'learning', seeds: language },
]

export function classifyKind(idea: string): string {
  const domain = DOMAINS.find((entry) => entry.test.test(idea))
  if (domain) return domain.kind
  if (/swim|run|jog|yoga|lift|gym|workout|fitness|sport|climb|cycle|hike|dance/i.test(idea)) return 'sport'
  if (/draw|paint|guitar|piano|music|photo|cook|bake/i.test(idea)) return 'creative-skill'
  if (/novel|film|write|poem|compose|design/i.test(idea)) return 'creative-project'
  if (/job|career|resume|interview|promotion/i.test(idea)) return 'career'
  if (/travel|visit|trip/i.test(idea)) return 'travel'
  if (/\bhabit\b|every day|daily routine/i.test(idea)) return 'habit'
  if (/personal project|side project|build a|make a/i.test(idea)) return 'personal-project'
  if (/sleep|meditat|anxiety|health|wellbeing|well-being/i.test(idea)) return 'health'
  if (/friend|family|conversation|network/i.test(idea)) return 'social'
  if (/math|history|science|study|course|exam/i.test(idea)) return 'academic'
  return 'learning'
}
