import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

const GO_TO_PRODUCTS = [
    "Yogurt (default: FAGE BestSelf Lactose Free 0% Milkfat) - 1 serving = 3/4 cup: 120 calories, 3.5g fat, 2.5g sat fat, 6g carbs, 6g total sugars, 0g added sugars, 17g protein.",
    "Cottage cheese (default: Lactaid Cottage Cheese) - 1 serving = 1/2 cup: 110 calories, 5g fat, 3g sat fat, 5g carbs, 4g total sugars, 0g added sugars, 13g protein.",
    "Cheese (default: Cabot Lite50 Sharp Cheddar Shredded) - 1 serving = 1/4 cup: 70 calories, 4g fat, 2.5g sat fat, 1g carbs, 0g sugars, 8g protein.",
  ].join("\n")

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

                    When the food description references any of these go-to products, use these exact macros as the base for a full serving, and scale proportionally if a different amount is mentioned:
                    ${GO_TO_PRODUCTS}

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
