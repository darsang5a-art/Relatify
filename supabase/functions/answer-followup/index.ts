import { corsHeaders } from '../_shared/cors.ts';

const ONSPACE_AI_API_KEY = Deno.env.get('ONSPACE_AI_API_KEY');
const ONSPACE_AI_BASE_URL = Deno.env.get('ONSPACE_AI_BASE_URL');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question, context, interests } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const interestsText = interests?.length > 0 ? interests.join(', ') : 'general knowledge';
    const contextText = context ? `\n\nContext from previous explanation: ${context}` : '';

    const prompt = `You are a helpful tutor answering a follow-up question. The learner is interested in: ${interestsText}.${contextText}

Follow-up question: "${question}"

Provide a clear, personalized answer that:
- Directly addresses their question
- Uses examples related to their interests when relevant
- Is encouraging and builds curiosity
- Is 2-4 paragraphs long

Answer naturally and conversationally. Do not use any special formatting or JSON.`;

    const response = await fetch(`${ONSPACE_AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ONSPACE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an encouraging tutor who loves helping curious learners understand complex topics.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OnSpace AI error:', errorText);
      throw new Error(`OnSpace AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    return new Response(
      JSON.stringify({ answer: { content } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in answer-followup:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to answer question' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
