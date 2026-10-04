# Sidequest

Sidequest is a small, gamified self-exploration app. You dump a messy list of things you want to do, learn, or finish, and each line becomes its own land on a medieval map.

> Don't turn your life into a to-do list. Turn it into a world you can explore.

There is no account. Progress is saved in your browser with `localStorage`. An optional OpenAI key, kept on this device, can draft quests and the guides on a quest. The app sends that key to its own `/api/ai` route, which calls OpenAI and checks any link before showing it. Without a key, or if the call fails, the local scribe and the shelf still answer.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:4179](http://localhost:4179). The dev server answers `POST /api/ai`.

```bash
npm run build    # typecheck and production build
npm run site     # serve dist and /api/ai on http://127.0.0.1:4187
```

A key can be pasted on the Journey screen. `OPENAI_API_KEY` in the server environment is used when the request does not include one. Neither is required.

## How to play

1. On the first screen, write one idea per line (or use the sample list) and choose **Map my adventure**.
2. On the map, click a land. Your hero walks the road, then a scroll opens. The land has no quests until you write them or accept suggestions from the Scribe. You can delete a kingdom from that scroll; coins, XP, and other lands stay.
3. On a quest, **Help me start** offers a short path and a few guides chosen for that quest, not the whole kingdom. On Journey you can paste an OpenAI key. It stays in this browser. Help me start and Ask the Scribe send it to this app’s `/api/ai` route, which calls OpenAI. With a key, the sheet says the guides were drafted for that quest, and a link is kept only after the page answers. Without a key, or if the call fails, the local shelf still answers and the sheet says they were curated. Ask the Scribe falls back to the plans in this browser the same way. Change the quest, and the next **Help me start** looks again. **Save to Toolkit** keeps a guide in the satchel, under that kingdom. Removing it from the Toolkit leaves it on the quest. **Tuck away** hides Help me start until you want it again. Opening a guide does not complete the quest.
4. Check off tasks to earn coins and XP. The purse at the top updates, and the coins fly there. When that XP crosses a level, the realm dims and a level-up page opens. **Continue** puts you back where you were. Sound for the chime (and the smaller coin notes) can be turned off on the Journey screen or on the level-up page.
5. Open **Homebase** and spend coins. Furniture you buy appears in the hall.
6. Open **Journey** to see level, streak, the month's goal, and a calendar of days you moved a quest forward.
7. **Burn this map & begin anew** on the Journey screen clears the save and returns you to the first screen.

Drag the map to pan. Scroll to zoom. The brass magnifying glass (the survey lens) zooms and centers a place without walking there.

## Where to change things

| What | File |
| --- | --- |
| App name, tagline, sample ideas, XP per level, monthly goal | `src/config/app.ts` |
| How a sentence becomes a kingdom name | `src/game/naming.ts` |
| Quest suggestions | `src/game/scribe.ts` and `src/game/domains.ts` (local). Optional drafts: `server/openai.mjs` |
| Resources for one quest | `src/game/resources.ts` (shelf) and `src/game/ai.ts` (optional OpenAI draft via `/api/ai`) |
| The Toolkit (bookmarks) | `src/components/Toolkit.tsx` |
| Where new lands are placed | `src/game/layout.ts` |
| Landmark drawings | `src/components/map/kingdomArt.tsx` |
| Shop items and prices | `src/config/shop.ts` |
| Furniture drawings | `src/components/home/Room.tsx` |
| Saved data key | `STORAGE_KEY` in `src/config/app.ts` |

The name lives in one constant, `APP_NAME`. The tab title, the onboarding screen, and the map cartouche all read it.

Homebase is the only place that exists before you write anything. Each idea becomes its own kingdom. The Scribe classifies the idea and offers a short progression of concrete actions. Nothing is added until you accept it. Deleting a kingdom removes that land and its quests only.

### Adding a drawing

1. Add a motif in `src/game/types.ts`.
2. Draw it in `src/components/map/kingdomArt.tsx`.
3. Point a rule at it in `src/game/naming.ts`.

### Adding furniture

1. Add an item to `SHOP_ITEMS` in `src/config/shop.ts`.
2. Draw it in `src/components/home/Room.tsx` inside `{has('your-id') && ( ... )}`.

## Project map

```
src/config/        name, places, shop
src/game/          quest rules, saving, shared state
src/components/    screens
src/components/map the world map
```

`src/game/logic.ts` does not touch the browser, so the rules are easy to read on their own. `GameContext` is the only place that writes the save.
