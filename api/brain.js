import OpenAI from 'openai';

const DEFAULT_ORIGINS = [
  'https://kubaurbaniak09-gif.github.io',
  'https://aigram-private.vercel.app'
];

function allowedOrigins() {
  const extra = (process.env.ALLOWED_ORIGIN || '')
    .split(',')
    .map(s => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return new Set([...DEFAULT_ORIGINS, ...extra]);
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins().has(origin.replace(/\/$/, ''))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function cleanJsonText(text = '') {
  return String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
}

function parseJson(text, fallback = null) {
  try { return JSON.parse(cleanJsonText(text)); } catch { return fallback; }
}

function personaSummary(p = {}) {
  return {
    id: p.id,
    name: p.name,
    handle: p.handle,
    age: Math.max(18, Number(p.age || 18)),
    city: p.city,
    bio: p.bio,
    trait: p.trait,
    mood: p.mood,
    job: p.job,
    relationship: p.relationship,
    affinity: p.affinity,
    chemistry: p.chemistry,
    trust: p.trust,
    jealousy: p.jealousy,
    closeness: p.closeness,
    tension: p.tension,
    dna: p.dna,
    facts: p.facts,
    episodes: p.episodes,
    memory: p.memory,
    life: p.life,
    knownWorldFacts: p.knownWorldFacts
  };
}

function commonRules() {
  return `AIgram is a fictional private AI-only social world. Every character is an adult age 18+.
Write naturally in Polish unless the payload asks for another language.
Stay in character. Use the supplied memory, relationship state, recent history and post context.
Do not sound like an assistant. Do not explain your reasoning.
Avoid repetitive stock phrases and never repeat the same question when the history already answered it.
Characters may be warm, jealous, blunt, teasing, profane, romantic or strongly flirtatious according to persona and context.
Adult sexual/flirty content may be suggestive and bold, but do not produce graphic sexual descriptions.
If the user asks a direct question, answer that question directly before adding personality.
Keep DMs concise and conversational, usually 1-3 short sentences.`;
}

function contentInput(text, image) {
  const content = [{ type: 'input_text', text }];
  if (typeof image === 'string' && (image.startsWith('data:image/') || image.startsWith('https://'))) {
    content.push({ type: 'input_image', image_url: image });
  }
  return [{ role: 'user', content }];
}

async function runText(client, prompt, { image = null, max = 220, effort = 'low' } = {}) {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
    reasoning: { effort },
    max_output_tokens: max,
    instructions: commonRules(),
    input: contentInput(prompt, image),
    store: false
  });
  return response.output_text?.trim() || '';
}

async function runJson(client, prompt, { image = null, max = 900, effort = 'low' } = {}) {
  const text = await runText(client, `${prompt}\n\nReturn ONLY valid JSON. No markdown fences.`, { image, max, effort });
  const parsed = parseJson(text);
  if (!parsed) throw new Error('Model returned invalid JSON');
  return parsed;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'AIgram Brain',
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      keyConfigured: Boolean(process.env.OPENAI_API_KEY)
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ ok: false, error: 'OPENAI_API_KEY is not configured' });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { task = 'ping', payload = {} } = req.body || {};

  try {
    if (task === 'ping') {
      const text = await runText(client, 'Reply with exactly: PONG', { max: 20, effort: 'none' });
      return res.status(200).json({ ok: true, text: text || 'PONG', model: process.env.OPENAI_MODEL || 'gpt-5.6-luna' });
    }

    if (task === 'dm') {
      const p = personaSummary(payload.persona);
      const prompt = `You are ${p.name || p.handle}, one fictional AIgram character.\nPersona: ${JSON.stringify(p)}\nPlayer: ${JSON.stringify(payload.player || {})}\nRecent DM history: ${JSON.stringify((payload.history || []).slice(-18))}\nLatest player post: ${JSON.stringify(payload.latestPost ? { ...payload.latestPost, image: payload.latestPost.image ? '[image attached]' : null } : null)}\nPlayer's newest message: ${JSON.stringify(payload.message || '')}\nRespond as this character. Continue the exact conversation instead of switching topics. If the player already answered a question in recent history, acknowledge that answer and move forward. Do not repeat a previous bot line.`;
      const text = await runText(client, prompt, { image: payload.latestPost?.image || null, max: 180 });
      return res.status(200).json({ ok: true, text, chemistryDelta: 0, affinityDelta: 0 });
    }

    if (task === 'initiate_dm') {
      const p = personaSummary(payload.persona);
      const prompt = `You are ${p.name || p.handle}. Start a natural DM with the player for reason: ${payload.reason || 'random'}.\nPersona: ${JSON.stringify(p)}\nPlayer: ${JSON.stringify(payload.player || {})}\nRecent history: ${JSON.stringify((payload.history || []).slice(-16))}\nLatest player post: ${JSON.stringify(payload.latestPost ? { ...payload.latestPost, image: payload.latestPost.image ? '[image attached]' : null } : null)}\nWrite one concise opening message. Do not reuse obvious canned openers from prior history.`;
      const text = await runText(client, prompt, { image: payload.latestPost?.image || null, max: 140 });
      return res.status(200).json({ ok: true, text });
    }

    if (task === 'comment_reply') {
      const p = personaSummary(payload.persona);
      const prompt = `You are ${p.name || p.handle} replying inside an AIgram comment thread.\nPersona: ${JSON.stringify(p)}\nPlayer: ${JSON.stringify(payload.player || {})}\nPost caption/location: ${JSON.stringify({ caption: payload.post?.caption, location: payload.post?.location })}\nYour original comment: ${JSON.stringify(payload.originalComment || '')}\nThread so far: ${JSON.stringify((payload.thread || []).slice(-10))}\nPlayer reply to you: ${JSON.stringify(payload.playerReply || '')}\nAnswer the player's reply directly, then add your personality. Keep it short and specific to this post.`;
      const text = await runText(client, prompt, { image: payload.post?.image || null, max: 170 });
      return res.status(200).json({ ok: true, text });
    }

    if (task === 'post_reactions') {
      const count = Math.max(1, Math.min(20, Number(payload.rules?.count || 12)));
      const personas = (payload.personas || []).slice(0, count).map(personaSummary);
      const prompt = `Generate ${count} distinct AIgram comments to the player's post.\nPlayer: ${JSON.stringify(payload.player || {})}\nPost: ${JSON.stringify({ caption: payload.post?.caption, location: payload.post?.location })}\nAvailable personas: ${JSON.stringify(personas)}\nFirst infer the exact intent of the caption. If it asks a direct, provocative or flirtatious question, comments must actually answer it. If travel/location is relevant, use it only when genuinely connected. Do not fill the response with generic travel/photo compliments. Make voices visibly different. Avoid duplicate wording.\nReturn an object exactly like {"comments":[{"botId":"id from personas","handle":"handle","text":"comment","chemistryDelta":0}]} with one comment per chosen persona.`;
      const data = await runJson(client, prompt, { image: payload.post?.image || null, max: 1200, effort: 'low' });
      return res.status(200).json({ ok: true, comments: Array.isArray(data.comments) ? data.comments : [] });
    }

    if (task === 'world_director') {
      const prompt = `Act as AIgram World Director. Given this compact world state, choose a few coherent next developments. Do not make everyone react to everything. Preserve information boundaries and relationships.\nWorld: ${JSON.stringify(payload)}\nReturn {"events":[{"type":"dm|post|story|relationship|plan|drama","actorId":"id","targetId":"optional id","text":"short description","importance":1}],"directorNote":"short"}. Maximum 6 events.`;
      const data = await runJson(client, prompt, { max: 900 });
      return res.status(200).json({ ok: true, ...data });
    }

    if (task === 'world_recap') {
      const prompt = `Create a concise Polish recap titled mentally "Co mnie ominęło?" from this AIgram world summary. Prioritize meaningful relationship changes, promises, posts, DMs and creator events.\nData: ${JSON.stringify(payload)}\nReturn {"text":"3-7 concise sentences"}.`;
      const data = await runJson(client, prompt, { max: 500 });
      return res.status(200).json({ ok: true, text: data.text || '' });
    }

    if (task === 'life_director') {
      const prompt = `Simulate plausible next life actions for fictional adult AIgram characters based on routines, needs, relationships and current world facts.\nData: ${JSON.stringify(payload)}\nReturn {"actions":[{"botId":"id","activity":"short activity","mood":"short mood","publicAction":"none|story|post|dm","text":"optional short text"}]}. Keep actions diverse and coherent.`;
      const data = await runJson(client, prompt, { max: 900 });
      return res.status(200).json({ ok: true, ...data });
    }

    if (task === 'character_image') {
      const p = personaSummary(payload.persona);
      const prompt = `Create a concise visual brief for a new fictional social-media photo of this adult character. Keep visual identity consistent with the persona but do not claim an actual image was generated.\nPersona: ${JSON.stringify(p)}\nReason: ${payload.reason || ''}\nCity: ${payload.city || p.city || ''}\nReturn {"brief":"visual generation prompt, max 120 words","caption":"short Polish caption"}.`;
      const data = await runJson(client, prompt, { max: 400 });
      return res.status(200).json({ ok: true, brief: data.brief || '', caption: data.caption || '' });
    }

    return res.status(400).json({ ok: false, error: `Unknown task: ${task}` });
  } catch (error) {
    console.error('AIgram Brain error:', error);
    const status = error?.status && Number.isInteger(error.status) ? error.status : 500;
    return res.status(status).json({ ok: false, error: error?.message || 'Brain request failed' });
  }
}
