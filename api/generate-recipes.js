import { GEMINI_API_KEY, cors } from './_utils.js';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const MOCK_RECIPES = [
  {
    name: 'Garden Fresh Salad',
    ingredients: ['lettuce', 'tomato', 'cucumber'],
    instructions: 'Wash and chop all vegetables. Toss together with olive oil and lemon juice. Season with salt and pepper.',
    prepTime: '10 minutes',
    servings: 2,
  },
  {
    name: 'Herb Butter Pasta',
    ingredients: ['pasta', 'butter', 'basil', 'garlic'],
    instructions: 'Cook pasta al dente. Melt butter, sauté garlic, add fresh herbs. Toss with pasta.',
    prepTime: '20 minutes',
    servings: 4,
  },
  {
    name: 'Veggie Stir Fry',
    ingredients: ['bell pepper', 'broccoli', 'carrot', 'soy sauce'],
    instructions: 'Chop vegetables. Heat oil in wok. Stir fry vegetables for 5 minutes. Add soy sauce and serve over rice.',
    prepTime: '15 minutes',
    servings: 3,
  },
];

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ingredients, quantity = 3 } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    // Fallback to mock recipes if no API key
    if (!GEMINI_API_KEY) {
      return res.status(200).json({ recipes: MOCK_RECIPES.slice(0, quantity) });
    }

    const prompt = `Generate ${quantity} recipes using these home-grown ingredients: ${ingredients.join(', ')}.
For each recipe, include the name, full ingredient list with quantities, step-by-step instructions, prep time, and servings.
Prefer Indian/Karnataka-style recipes when possible.
Return as a JSON array of objects with keys: name, ingredients (array), instructions (string), prepTime, servings.`;

    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      console.error('Gemini recipe error:', errBody);
      return res.status(200).json({ recipes: MOCK_RECIPES.slice(0, quantity) });
    }

    const data = await geminiResponse.json();
    const textResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    let recipes;
    try {
      recipes = JSON.parse(textResponse);
      if (!Array.isArray(recipes)) {
        recipes = [recipes];
      }
    } catch {
      recipes = MOCK_RECIPES.slice(0, quantity);
    }

    return res.status(200).json({ recipes });
  } catch (error) {
    console.error('Generate recipes error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
