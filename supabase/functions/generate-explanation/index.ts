import { corsHeaders } from '../_shared/cors.ts';

const ONSPACE_AI_API_KEY = Deno.env.get('ONSPACE_AI_API_KEY');
const ONSPACE_AI_BASE_URL = Deno.env.get('ONSPACE_AI_BASE_URL');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { topic, interests } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const interestsText = interests?.length > 0 ? interests.join(', ') : 'general knowledge';

    const prompt = `You are an expert educator creating personalized learning content. The learner is interested in: ${interestsText}.

Topic to explain: "${topic}"

Create a comprehensive, engaging explanation with the following sections:

1. SIMPLE EXPLANATION (2-3 sentences): Clear, concise overview anyone can understand.

2. PERSONALIZED ANALOGY: Connect this topic to the learner's interests (${interestsText}) in a natural, accurate way that genuinely illuminates the concept.

3. STEP-BY-STEP BREAKDOWN: Break down the concept into 4-5 digestible steps.

4. VISUAL MENTAL MODEL: Describe a clear mental image or diagram that represents this concept (what to visualize).

5. DEEPER DIVE: More detailed explanation for those wanting to understand the nuances and complexities (2-3 paragraphs).

6. REAL-WORLD APPLICATIONS: List 3-4 concrete examples of how this applies in everyday life or professional settings.

7. PRACTICE QUESTIONS: Create 3 thought-provoking questions that help reinforce understanding.

8. MINI QUIZ: Create 3 multiple-choice questions with 4 options each. Mark the correct answer.

Format your response as a valid JSON object with this exact structure:
{
  "simple": "...",
  "analogy": "...",
  "stepByStep": ["step 1", "step 2", ...],
  "visualModel": "...",
  "deeperDive": "...",
  "realWorld": ["example 1", "example 2", ...],
  "practiceQuestions": ["question 1", "question 2", "question 3"],
  "quiz": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": 0
    },
    ...
  ]
}

Use a clear, engaging tone appropriate for curious learners of all ages.`;

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
            content: 'You are a brilliant educator who creates personalized, engaging explanations. Always respond with valid JSON only, no markdown formatting.',
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

    let explanationData;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      explanationData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(
      JSON.stringify({ explanationData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-explanation:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate explanation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
