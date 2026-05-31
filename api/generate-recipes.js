import { GEMINI_API_KEY, cors } from './_utils.js';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const MOCK_RECIPES = [
  {
    name: 'Garden Fresh Salad',
    description: 'A crisp, cooling salad featuring freshly harvested garden greens and vine-ripened tomatoes.',
    difficulty: 'Easy',
    ingredients: ['2 cups Lettuce', '1 medium Tomato, diced', '1 Cucumber, sliced', '1 tbsp Olive oil', '1 tbsp Lemon juice', 'Salt & Pepper to taste'],
    instructions: [
      'Wash the lettuce, tomato, and cucumber thoroughly under clean running water.',
      'Chop the lettuce, dice the tomato, and slice the cucumber into bite-sized pieces.',
      'Toss the vegetables together in a large mixing bowl.',
      'Drizzle with olive oil and fresh lemon juice, then season with salt and pepper. Toss gently and serve immediately.'
    ],
    prepTime: '10 mins',
    servings: 2,
  },
  {
    name: 'South Indian Herb Butter Pasta',
    description: 'A fusion pasta dish tossed in aromatic garlic-herb butter, using fresh basil and curry leaves.',
    difficulty: 'Medium',
    ingredients: ['200g Pasta (any type)', '2 tbsp Salted Butter', 'A handful of fresh Basil leaves', '10-12 fresh Curry Leaves', '3 cloves Garlic, minced', '1 green Chili, slit'],
    instructions: [
      'Cook the pasta in boiling salted water according to package instructions until al dente. Drain and set aside.',
      'In a pan, melt the butter over low heat. Add the minced garlic and sauté for 1 minute until fragrant.',
      'Toss in the fresh curry leaves and slit green chili, letting them crackle in the butter.',
      'Add the cooked pasta and fresh basil leaves. Toss well for 2 minutes to coat the pasta with the herb butter and serve warm.'
    ],
    prepTime: '20 mins',
    servings: 4,
  },
  {
    name: 'Spicy Garden Veggie Stir Fry',
    description: 'A quick and healthy stir-fry utilizing home-grown vegetables, seasoned with soy sauce and local spices.',
    difficulty: 'Easy',
    ingredients: ['1 Bell Pepper, sliced', '1 cup Broccoli florets', '1 Carrot, julienned', '1 tbsp Cooking oil', '2 tbsp Soy sauce', '1 tsp Ginger-garlic paste', '1 tsp Chili flakes'],
    instructions: [
      'Clean and slice all the vegetables into uniform pieces.',
      'Heat oil in a wok or large pan over high heat. Add ginger-garlic paste and sauté for 30 seconds.',
      'Add carrots and broccoli, stir-frying for 3 minutes as they take longer to cook.',
      'Add bell peppers and stir-fry for another 2 minutes until tender-crisp.',
      'Pour in the soy sauce, sprinkle chili flakes, toss everything together for 1 minute, and serve hot.'
    ],
    prepTime: '15 mins',
    servings: 3,
  },
];

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ingredients, harvestQty = 'a handful', recipeCount = 3 } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    // Parse recipeCount to ensure it is a valid integer
    const count = parseInt(recipeCount, 10) || 3;

    // Fallback to mock recipes if no API key
    if (!GEMINI_API_KEY) {
      return res.status(200).json({ recipes: MOCK_RECIPES.slice(0, count) });
    }

    const prompt = `Generate ${count} culinary recipes using these home-grown ingredients: ${ingredients.join(', ')} (approximate harvest quantity: ${harvestQty}).
For each recipe, include the name, a short description, difficulty (Easy/Medium/Hard), full ingredient list with quantities, step-by-step instructions (as a JSON array of strings), prep time, and servings.
Prefer Indian/Karnataka-style recipes when possible.
Return ONLY a valid JSON array of objects with the exact keys: name, description, difficulty, ingredients (array of strings), instructions (array of strings), prepTime, servings.
Do not include any extra text outside the JSON array.`;

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
      console.error('Gemini recipe API error:', errBody);
      return res.status(200).json({ recipes: MOCK_RECIPES.slice(0, count) });
    }

    const data = await geminiResponse.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    let recipes;
    try {
      // Clean up markdown block if present
      const jsonMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : textResponse.trim();
      recipes = JSON.parse(jsonStr);
      if (!Array.isArray(recipes)) {
        recipes = [recipes];
      }
    } catch (parseErr) {
      console.error('Failed to parse Gemini recipes response:', parseErr, textResponse);
      recipes = MOCK_RECIPES.slice(0, count);
    }

    return res.status(200).json({ recipes });
  } catch (error) {
    console.error('Generate recipes handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
