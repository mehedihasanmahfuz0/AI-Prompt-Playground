import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const MAX_PROMPT_LENGTH = 8000

const SYSTEM_PROMPT = `You are an expert prompt engineer. Analyze the user's prompt and return ONLY a valid JSON object. No markdown, no explanation, no code blocks — raw JSON only.

Required JSON shape:
{
  "score": <integer 0-100>,
  "criteria": {
    "clarity": <integer 0-100>,
    "context": <integer 0-100>,
    "constraints": <integer 0-100>,
    "outputFormat": <integer 0-100>
  },
  "suggestions": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}

Scoring:
- clarity: Is the instruction unambiguous and easy to follow?
- context: Is enough background / domain info provided?
- constraints: Are inclusion/exclusion rules or tone specified?
- outputFormat: Is the desired format, length, or style stated?
- score: Math.round(clarity*0.30 + context*0.25 + constraints*0.25 + outputFormat*0.20)
- suggestions: 3 specific, actionable one-sentence tips to improve the prompt. Not generic. Target the weakest areas.`

function safeParseJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
  return JSON.parse(cleaned)
}

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'Server misconfiguration: API key not set.' },
      { status: 500 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { prompt } = body as { prompt?: string }

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: 'Prompt is too long.' }, { status: 400 })
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt.trim() },
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 512,
      temperature: 0.3,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    let result: Record<string, unknown>

    try {
      result = safeParseJson(raw) as Record<string, unknown>
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    const criteria = result.criteria as Record<string, unknown> | undefined
    const score = Math.min(100, Math.max(0, parseInt(String(result.score)) || 0))
    const parsedCriteria = {
      clarity: Math.min(100, Math.max(0, parseInt(String(criteria?.clarity)) || 0)),
      context: Math.min(100, Math.max(0, parseInt(String(criteria?.context)) || 0)),
      constraints: Math.min(100, Math.max(0, parseInt(String(criteria?.constraints)) || 0)),
      outputFormat: Math.min(100, Math.max(0, parseInt(String(criteria?.outputFormat)) || 0)),
    }
    const suggestions = Array.isArray(result.suggestions)
      ? (result.suggestions as unknown[])
          .filter((s): s is string => typeof s === 'string')
          .slice(0, 5)
      : []

    return NextResponse.json({ score, criteria: parsedCriteria, suggestions })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    console.error('[api/analyze]', e?.message)
    if (e?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment.' },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { error: 'AI service error. Please try again.' },
      { status: 500 }
    )
  }
}
