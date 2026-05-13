import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  const { query } = await req.json()

  if (!query?.trim()) {
    return NextResponse.json({ error: 'No food description provided' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are a nutrition expert. Calculate the total nutritional content for the following food description and return ONLY a valid JSON object with no other text or formatting.

Use these exact fields:
- name: a concise readable label for this food entry (string, max 60 chars)
- calories: total calories rounded to nearest integer
- protein: total protein in grams, 1 decimal place
- carbs: total carbohydrates in grams, 1 decimal place
- fat: total fat in grams, 1 decimal place

Food description: ${query}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(cleaned)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Could not parse nutrition data' }, { status: 500 })
  }
}
