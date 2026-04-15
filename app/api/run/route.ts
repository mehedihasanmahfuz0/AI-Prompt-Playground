import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const ALLOWED_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] as const
const MAX_PROMPT_LENGTH = 8000

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

  const { prompt, model } = body as { prompt?: string; model?: string }

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters.` },
      { status: 400 }
    )
  }

  const selectedModel = ALLOWED_MODELS.includes(model as (typeof ALLOWED_MODELS)[number])
    ? (model as (typeof ALLOWED_MODELS)[number])
    : ALLOWED_MODELS[0]

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt.trim() }],
      model: selectedModel,
      max_tokens: 2048,
      temperature: 0.7,
    })

    return NextResponse.json({
      output: completion.choices[0]?.message?.content ?? '',
      model: selectedModel,
      usage: completion.usage,
    })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    console.error('[api/run]', e?.message)
    if (e?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { error: 'AI service error. Please try again.' },
      { status: 500 }
    )
  }
}
