import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const MAX_PROMPT_LENGTH = 8000

const SYSTEM_PROMPT = `You are an expert prompt engineer. Rewrite the user's prompt to make it more effective, specific, and clear.

Rules:
- Keep the original intent intact
- Add missing context, constraints, or output format if absent
- Be specific — replace vague terms with concrete ones
- Do NOT add a preamble like "Here is the improved prompt:" or similar
- Return ONLY the rewritten prompt text — nothing else
- Match the original language (don't switch languages)`

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
      max_tokens: 1024,
      temperature: 0.5,
    })

    const rewritten = completion.choices[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ rewritten })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    console.error('[api/rewrite]', e?.message)
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
