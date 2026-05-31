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

function generateDynamicMocks(ingredients, harvestQty, count) {
  const mainIng = ingredients[0] || 'Garden Herb';
  const secondIng = ingredients[1] || (ingredients[0] ? 'Garnish' : 'Vegetables');

  const mockRecipesList = [
    {
      name: `Karnataka Style ${mainIng} & ${secondIng} Chutney`,
      description: `A traditional, tangy and spicy chutney from Karnataka featuring freshly harvested ${mainIng} and ${secondIng}, perfect with idli, dosa, or hot rice.`,
      difficulty: 'Easy',
      ingredients: [
        `${harvestQty} fresh ${mainIng}`,
        ingredients[1] ? `A handful of fresh ${secondIng}` : '2-3 sprigs of Curry leaves',
        '1 tbsp Cooking Oil',
        '1 tsp Mustard seeds',
        '1 tsp Urad dal',
        '2-3 Dry red chilies',
        'A small piece of Tamarind',
        'Salt to taste'
      ],
      instructions: [
        `Wash the fresh ${mainIng} ${ingredients[1] ? `and ${secondIng}` : ''} thoroughly.`,
        'Heat oil in a pan, add urad dal, mustard seeds, and dry red chilies. Sauté until the dal turns golden brown.',
        `Add the fresh ${mainIng} and sauté for 2-3 minutes until wilted.`,
        'Let the mixture cool down completely.',
        'Grind the sautéed ingredients with tamarind and salt into a smooth paste, adding a little water if needed.',
        'Serve fresh with hot rice or dose!'
      ],
      prepTime: '12 mins',
      servings: 3
    },
    {
      name: `Spicy ${mainIng} & ${secondIng} Garden Stir-Fry`,
      description: `A quick, healthy stir-fry highlighting the fresh crunch of ${mainIng} complemented by the aroma of ${secondIng}.`,
      difficulty: 'Easy',
      ingredients: [
        `2 cups of chopped ${mainIng}`,
        ingredients[1] ? `1/2 cup of ${secondIng}` : 'A handful of fresh herbs',
        '1 tbsp Cooking oil',
        '2 cloves Garlic, minced',
        '1 green chili, slit',
        '1/2 tsp Turmeric powder',
        '1/2 tsp Mustard seeds',
        'Salt & black pepper to taste'
      ],
      instructions: [
        `Thoroughly rinse the fresh ${mainIng} and ${secondIng} under running water.`,
        'Heat cooking oil in a pan or wok over medium heat. Crackle the mustard seeds.',
        'Add minced garlic and green chili. Sauté for 30 seconds until fragrant.',
        `Toss in the chopped ${mainIng} and sauté for 3-4 minutes.`,
        `Add the ${secondIng}, turmeric, salt, and pepper. Stir fry on high heat for another 2 minutes.`,
        'Serve hot as a healthy side dish.'
      ],
      prepTime: '15 mins',
      servings: 2
    },
    {
      name: `Aromatic ${mainIng} & ${secondIng} Wellness Brew`,
      description: `An immune-boosting herbal infusion utilizing fresh ${secondIng} and ${mainIng} straight from your home garden.`,
      difficulty: 'Easy',
      ingredients: [
        ingredients[1] ? `A small handful of fresh ${secondIng}` : `A few sprigs of ${mainIng}`,
        ingredients[0] && ingredients[1] ? `2-3 leaves of ${mainIng}` : '1 Lemon, sliced',
        '3 cups Water',
        '1 inch Ginger, crushed',
        '2-3 Black peppercorns, crushed',
        '1 tsp Honey or Jaggery (optional)'
      ],
      instructions: [
        `Gently crush the washed ${mainIng} and ${secondIng} leaves to release their essential oils.`,
        'Bring 3 cups of water to a boil in a saucepan.',
        `Add the crushed ingredients, ginger, and black peppercorns to the boiling water.`,
        'Reduce the heat and let it simmer for 5-7 minutes until the water reduces slightly.',
        'Strain the herbal brew into cups.',
        'Stir in honey or jaggery if desired, and sip warm.'
      ],
      prepTime: '10 mins',
      servings: 2
    }
  ];

  return mockRecipesList.slice(0, count);
}

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

    // Fallback to dynamic mock recipes if no API key
    if (!GEMINI_API_KEY) {
      return res.status(200).json({ recipes: generateDynamicMocks(ingredients, harvestQty, count) });
    }

    const prompt = `Generate ${count} completely unique and different culinary recipes based SPECIFICALLY on this combination of home-grown ingredients: ${ingredients.join(', ')} (approximate harvest quantity: ${harvestQty}).
Each recipe MUST feature these ingredients: ${ingredients.join(', ')} prominently. The recipes must be distinctly different from one another in terms of style (e.g. one salad/stir-fry, one main dish/curry, one soup/beverage), flavor profile, and cooking technique. Do NOT return similar or repetitive recipes.
Prefer authentic Indian (especially South Indian/Karnataka-style like Chutney, Gojju, Saaru, or Pulao) when possible.
For each recipe, include the name, a short description, difficulty (Easy/Medium/Hard), full ingredient list with quantities, step-by-step instructions (as a JSON array of strings), prep time, and servings.
Return ONLY a valid JSON array of objects with the exact keys: name, description, difficulty, ingredients (array of strings), instructions (array of strings), prepTime, servings.
Do not include any extra text outside the JSON array. [Random Seed: ${Math.random()}]`;

    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      console.error('Gemini recipe API error:', errBody);
      return res.status(200).json({ recipes: generateDynamicMocks(ingredients, harvestQty, count) });
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
      recipes = generateDynamicMocks(ingredients, harvestQty, count);
    }

    return res.status(200).json({ recipes });
  } catch (error) {
    console.error('Generate recipes handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

