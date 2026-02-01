import { z } from 'zod';

const chatResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string(),
        }),
      }),
    )
    .min(1),
});

export async function chatCompletion(params: {
  systemPrompt: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const { systemPrompt, userMessage, model = 'gpt-4o-mini', maxTokens = 2000 } = params;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`OpenAI Chat API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = chatResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Unexpected OpenAI Chat API response format');
  }

  return parsed.data.choices[0].message.content;
}
