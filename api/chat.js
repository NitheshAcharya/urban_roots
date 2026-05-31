import { supabase, GEMINI_API_KEY, cors } from './_utils.js';

const GEMINI_CHAT_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `You are UrbanRoots AI — a friendly, expert plant care assistant specializing in Karnataka (India) climate, soil, and gardening. You help users with:
- Plant selection for Karnataka's tropical/subtropical climate
- Watering schedules, fertilization, and pest control
- Seasonal planting guides for Bangalore, Mysore, Mangalore, and other Karnataka cities
- Balcony, terrace, and indoor gardening tips
- Organic and sustainable gardening practices
Keep answers concise, practical, and localized to Karnataka conditions. Use both English and Kannada plant names when relevant.`;

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [], userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Build conversation contents
    const contents = [];

    // Add history
    for (const entry of history) {
      contents.push({
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: entry.content }],
      });
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const geminiResponse = await fetch(GEMINI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      console.error('Gemini API error:', errBody);
      return res.status(502).json({ error: 'Failed to get response from Gemini API' });
    }

    const data = await geminiResponse.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response.';

    // Log to Supabase if userId is provided
    if (userId) {
      await supabase.from('chat_history').insert([{
          user_id: userId,
          user_message: message,
          bot_response: reply,
        }]);
    }

    return res.status(200).json({ response: reply });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
