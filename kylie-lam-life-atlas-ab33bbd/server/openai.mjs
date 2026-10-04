/**
 * Same-origin OpenAI proxy for Help me start and Ask the Scribe.
 * The browser posts here. The key is the one in the request, or OPENAI_API_KEY.
 * Resource links are checked before they are returned. A dead link becomes a note.
 */

const MODEL = 'gpt-4o-mini'
const ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const STAGES = new Set(['Foundation', 'Practice', 'Application', 'Challenge', 'Reflection'])
const KINDS = new Set(['watch', 'read', 'explore', 'get', 'go', 'tool', 'checklist', 'inspire'])

const RESOURCE_INSTRUCTIONS = `You draft starting resources for one quest in a fantasy productivity app.
The kingdom is broad context. The quest title and description are what the person is actually trying to do.
Two quests in the same kingdom must not get the same set of resources.
Return JSON with this shape:
{"resources":[{"kind":"read","title":"","source":"","why":"","url":null,"minutes":10}],"startPath":[{"kind":"act","title":"","detail":""}]}
kind is one of watch, read, explore, get, go, tool, checklist, inspire.
Give 3 to 5 resources. Mix formats. Relevance to the exact quest comes first.
Put a https URL only when you know that exact page exists. If you are not sure, set url to null and source to "Written for this quest".
Never invent a URL. A missing link is better than a wrong one.
Honor constraints written in the quest, such as "no Dutch oven", "beginner", or "near a train station".
startPath has 2 to 4 ordered steps. The last step is doing the quest, not reading about the kingdom.`

const QUEST_INSTRUCTIONS = `You suggest quests for one kingdom in a fantasy productivity app.
Each quest is one specific action the person can finish, not a vague goal like "learn the basics" or "get better".
Do not repeat a title or action that is already on the quest list.
The kingdom is context. The quests must fit the idea, the mode, the level, the time, the focus, and the note.
Return JSON with this shape:
{"quests":[{"title":"","action":"","why":"","stage":"Foundation","difficulty":1,"minutes":20}]}
stage is one of Foundation, Practice, Application, Challenge, Reflection.
difficulty is 1, 2, or 3. minutes is a whole number from 5 to 180.
Give 3 to 5 quests.
Mode foundation: early steps a beginner can finish.
Mode challenge: harder application, not a restatement of the easy steps.
Mode quick: each quest takes about 20 minutes or less.
Mode long: a path that moves across stages, from foundation toward a challenge.
Mode surprise: a varied mix, still specific to this kingdom.`

function clip(text, max) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).trim()
}

function publicError(status, message) {
  if (status === 401) return 'That API key was refused. Check it on the Journey screen.'
  const cleaned = clip(String(message ?? '').replace(/sk-[A-Za-z0-9_-]+/g, 'sk-…'), 180)
  return cleaned || 'The AI guide could not answer.'
}

function asHttps(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:') return null
    const host = url.hostname.toLowerCase()
    if (host === 'example.com' || host.endsWith('.example') || host === 'localhost' || host === '127.0.0.1') return null
    return url.toString()
  } catch {
    return null
  }
}

/** Model JSON for Help me start, before link checks. Null when it cannot be used. */
export function shapeResources(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.resources)) return null
  const seen = new Set()
  const resources = []
  for (const item of data.resources) {
    if (!item || typeof item !== 'object') continue
    if (typeof item.title !== 'string' || !item.title.trim()) continue
    const url = asHttps(item.url)
    if (url && seen.has(url)) continue
    if (url) seen.add(url)
    const kind = KINDS.has(item.kind) ? item.kind : 'read'
    const source = typeof item.source === 'string' && item.source.trim() ? clip(item.source, 80) : url ? 'Web' : 'Written for this quest'
    resources.push({
      kind,
      title: clip(item.title, 120),
      source: url ? source : 'Written for this quest',
      why: typeof item.why === 'string' ? clip(item.why, 420) : '',
      url,
      minutes: Number(item.minutes) > 0 ? Math.min(180, Math.round(Number(item.minutes))) : null,
    })
    if (resources.length >= 5) break
  }
  if (resources.length < 2) return null

  const startPath = []
  if (Array.isArray(data.startPath)) {
    for (const item of data.startPath) {
      if (!item || typeof item !== 'object') continue
      if (typeof item.title !== 'string' || !item.title.trim()) continue
      const kind = item.kind === 'act' || KINDS.has(item.kind) ? item.kind : 'act'
      startPath.push({
        kind,
        title: clip(item.title, 120),
        detail: typeof item.detail === 'string' ? clip(item.detail, 280) : '',
      })
      if (startPath.length >= 4) break
    }
  }
  if (startPath.length === 0) {
    startPath.push({
      kind: 'act',
      title: resources[0].title,
      detail: 'Do the quest itself. Opening a guide does not finish it.',
    })
  }
  return { resources, startPath }
}

/** Model JSON for Ask the Scribe. Null when fewer than two quests survive. */
export function shapeQuests(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.quests)) return null
  const seen = new Set()
  const quests = []
  for (const item of data.quests) {
    if (!item || typeof item !== 'object') continue
    if (typeof item.title !== 'string' || !item.title.trim()) continue
    if (typeof item.action !== 'string' || !item.action.trim()) continue
    const title = clip(item.title, 80)
    const key = title.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    const difficulty = item.difficulty === 1 || item.difficulty === 3 ? item.difficulty : 2
    const stage = STAGES.has(item.stage) ? item.stage : 'Practice'
    const minutes = Number(item.minutes) > 0 ? Math.min(180, Math.max(5, Math.round(Number(item.minutes)))) : 25
    quests.push({
      title,
      action: clip(item.action, 280),
      why: typeof item.why === 'string' ? clip(item.why, 280) : '',
      stage,
      difficulty,
      minutes,
    })
    if (quests.length >= 5) break
  }
  if (quests.length < 2) return null
  return { quests }
}

function lines(value, max) {
  return clip(value, max) || '(none)'
}

function resourcePrompt(payload) {
  if (!payload || typeof payload !== 'object') return null
  const quest = clip(payload.questLabel, 200)
  if (!quest) return null
  const used = Array.isArray(payload.usedUrls) ? payload.usedUrls.map((url) => asHttps(url)).filter(Boolean).slice(0, 30) : []
  return [
    `Kingdom idea: ${lines(payload.idea, 400)}`,
    `Kingdom name: ${lines(payload.kingdomName, 120)}`,
    `Kingdom description: ${lines(payload.kingdomDescription, 400)}`,
    `Category: ${lines(payload.category, 80)}`,
    `Quest title: ${quest}`,
    `Quest description: ${lines(payload.questDescription, 800)}`,
    `Priority: ${lines(payload.priority, 20)}`,
    `Minutes: ${lines(payload.minutes, 8)}`,
    used.length ? `URLs already used by other quests in this kingdom, avoid unless essential:\n${used.join('\n')}` : 'No sibling URLs yet.',
    'Draft resources for the quest title and description. The kingdom is context only.',
  ].join('\n')
}

function questPrompt(payload) {
  if (!payload || typeof payload !== 'object') return null
  const idea = clip(payload.idea, 400)
  const name = clip(payload.kingdomName, 120)
  if (!idea && !name) return null
  const brief = payload.brief && typeof payload.brief === 'object' ? payload.brief : {}
  const labels = Array.isArray(payload.existingLabels)
    ? payload.existingLabels.map((label) => clip(label, 120)).filter(Boolean).slice(0, 40)
    : []
  const mode = ['foundation', 'challenge', 'quick', 'long', 'surprise'].includes(payload.mode) ? payload.mode : 'foundation'
  return [
    `Kingdom idea: ${idea || '(none)'}`,
    `Kingdom name: ${name || '(none)'}`,
    `Kingdom description: ${lines(payload.kingdomDescription, 400)}`,
    `Category: ${lines(payload.category, 80)}`,
    `Mode: ${mode}`,
    `Level: ${lines(brief.level, 20)}`,
    `Focus: ${lines(brief.focus, 160)}`,
    `Time available: ${lines(brief.time, 8)}`,
    `Note: ${lines(brief.note, 400)}`,
    labels.length ? `Quests already on this kingdom, do not repeat them:\n${labels.join('\n')}` : 'No quests yet.',
  ].join('\n')
}

async function urlAnswers(url) {
  const headers = {
    Accept: 'text/html,application/xhtml+xml',
    'User-Agent': 'Mozilla/5.0 (compatible; SidequestLinkCheck/1.0)',
  }
  const once = async (method) => {
    const response = await fetch(url, { method, redirect: 'follow', headers, signal: AbortSignal.timeout(7000) })
    await response.body?.cancel().catch(() => {})
    return response
  }
  try {
    let response = await once('HEAD')
    if (response.status === 405 || response.status === 403 || response.status === 401) response = await once('GET')
    return response.ok
  } catch {
    return false
  }
}

async function checkResourceLinks(draft) {
  await Promise.all(
    draft.resources.map(async (item) => {
      if (!item.url) return
      const alive = await urlAnswers(item.url)
      if (alive) return
      item.url = null
      item.source = 'Written for this quest'
    }),
  )
  return draft
}

async function complete(key, instructions, prompt) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(25000),
  })
  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body?.error?.message ?? ''
    } catch {
      detail = ''
    }
    return { status: response.status === 401 ? 401 : 502, json: { error: publicError(response.status, detail) } }
  }
  const body = await response.json()
  const content = body?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    return { status: 502, json: { error: 'The AI guide sent an empty reply.' } }
  }
  try {
    return { status: 200, data: JSON.parse(content) }
  } catch {
    return { status: 502, json: { error: 'The AI guide did not return usable JSON.' } }
  }
}

export function readJson(req, limit = 32000) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(text ? JSON.parse(text) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, json) {
  const body = JSON.stringify(json)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

/** POST /api/ai body: { purpose: 'resources' | 'quests', key?: string, payload } */
export async function handleAi(body) {
  const purpose = body?.purpose
  if (purpose !== 'resources' && purpose !== 'quests') {
    return { status: 400, json: { error: 'Unknown request.' } }
  }
  const pasted = typeof body.key === 'string' ? body.key.trim() : ''
  const key = pasted || process.env.OPENAI_API_KEY?.trim() || ''
  if (!key) return { status: 503, json: { error: 'No API key is set.' } }

  const prompt = purpose === 'resources' ? resourcePrompt(body.payload) : questPrompt(body.payload)
  if (!prompt) return { status: 400, json: { error: 'The request was missing the quest.' } }

  const completion = await complete(key, purpose === 'resources' ? RESOURCE_INSTRUCTIONS : QUEST_INSTRUCTIONS, prompt)
  if (completion.status !== 200) return completion

  if (purpose === 'resources') {
    const shaped = shapeResources(completion.data)
    if (!shaped) return { status: 502, json: { error: 'The AI guide did not return usable resources.' } }
    return { status: 200, json: await checkResourceLinks(shaped) }
  }
  const shaped = shapeQuests(completion.data)
  if (!shaped) return { status: 502, json: { error: 'The AI guide did not return usable quests.' } }
  const taken = new Set(
    (Array.isArray(body.payload?.existingLabels) ? body.payload.existingLabels : [])
      .map((label) => clip(label, 120).toLowerCase())
      .filter(Boolean),
  )
  const quests = shaped.quests.filter((quest) => !taken.has(quest.title.toLowerCase()))
  if (quests.length < 2) return { status: 502, json: { error: 'The AI guide repeated quests already on this kingdom.' } }
  return { status: 200, json: { quests } }
}

export async function handleAiHttp(req, res) {
  const pathname = (req.url ?? '').split('?')[0]
  if (pathname !== '/api/ai') return false
  if (req.method === 'GET') {
    send(res, 200, { configured: Boolean(process.env.OPENAI_API_KEY?.trim()) })
    return true
  }
  if (req.method !== 'POST') {
    send(res, 405, { error: 'POST only.' })
    return true
  }
  try {
    const body = await readJson(req)
    const result = await handleAi(body)
    send(res, result.status, result.json)
  } catch {
    send(res, 400, { error: 'The request could not be read.' })
  }
  return true
}
