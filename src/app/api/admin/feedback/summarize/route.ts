import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/admin-guard';
import { chatCompletion } from '@/lib/ai/openai-chat';

export async function POST() {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { adminClient } = guard;

    const { data: feedback, error } = await adminClient
      .from('feedback')
      .select('*')
      .in('status', ['new', 'reviewed'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!feedback || feedback.length === 0) {
      return NextResponse.json({
        summary: {
          totalAnalyzed: 0,
          categories: {},
          claudePrompt: null,
        },
      });
    }

    const feedbackText = feedback
      .map(
        (f, i) =>
          `[${i + 1}] Status: ${f.status} | Page: ${f.page_url} | Device: ${f.user_agent ?? 'unknown'} | Screen: ${f.screen_size ?? 'unknown'}\nMessage: ${f.message}`,
      )
      .join('\n\n');

    const systemPrompt = `You are an expert product analyst for KalasKoll, a Swedish children's party invitation webapp. Analyze user feedback and return a JSON object with this exact structure:

{
  "totalAnalyzed": <number>,
  "categories": {
    "bugs": { "count": <number>, "items": [{ "summary": "<string>", "severity": "high|medium|low", "feedbackIds": [<numbers>] }] },
    "featureRequests": { "count": <number>, "items": [{ "summary": "<string>", "feedbackIds": [<numbers>] }] },
    "uxIssues": { "count": <number>, "items": [{ "summary": "<string>", "feedbackIds": [<numbers>] }] },
    "praise": { "count": <number>, "items": [{ "summary": "<string>", "feedbackIds": [<numbers>] }] }
  },
  "claudePrompt": "<A detailed prompt for Claude Code to fix the reported bugs and implement requested features. Include specific file paths if inferrable from page URLs. Write in English.>"
}

Rules:
- Respond ONLY with valid JSON, no markdown fences
- Summarize in Swedish for items, but claudePrompt in English
- Group similar feedback together
- feedbackIds reference the [N] numbers in the input
- severity for bugs: high = blocks usage, medium = annoying, low = cosmetic`;

    const aiResponse = await chatCompletion({
      systemPrompt,
      userMessage: feedbackText,
      maxTokens: 3000,
    });

    const summary = JSON.parse(aiResponse);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Admin feedback summarize error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 },
    );
  }
}
