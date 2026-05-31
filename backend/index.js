import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
// import Razorpay from 'razorpay'; // Paused
import { Resend } from 'resend';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// Gemini Vision API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_VISION_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

// --- GEMINI CHAT ENDPOINT (text-only for plant Q&A) ---
app.post('/api/chat', async (req, res) => {
  const { message, history, userId } = req.body;

  try {
    if (!GEMINI_API_KEY) throw new Error('No Gemini API key configured');

    const systemInstruction = `You are a plant care expert for Karnataka, India. Give short practical advice about growing plants in Bangalore's climate. Mention local plant names in Kannada where helpful. Keep responses under 4 sentences for chat UI. Be warm and friendly.`;

    const contents = [
      ...(history || []).map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `Gemini error ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';

    // Log message to chat_history table in Supabase if userId is provided
    if (userId) {
      try {
        await supabase.from('chat_history').insert([{
          user_id: userId,
          user_message: message,
          bot_response: text
        }]);
      } catch (dbError) {
        console.error('Error logging to chat_history:', dbError.message);
      }
    }

    res.json({ response: text });
  } catch (error) {
    console.error('Gemini chat error:', error.message);
    res.status(503).json({
      error: 'AI unavailable',
      response: 'AI chat is currently offline. Please check your GEMINI_API_KEY in backend/.env'
    });
  }
});

// --- GET CHAT HISTORY ENDPOINT ---
app.get('/api/chat-history/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('user_message, bot_response, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching chat history:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- GEMINI VISION PLANT ANALYSIS ENDPOINT ---
app.post('/api/analyze-plant', async (req, res) => {
  const { image, mode } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'No GEMINI_API_KEY set in backend/.env' });
  }

  let prompt = '';
  if (mode === 'disease') {
    prompt = `You are a plant pathology expert. Carefully analyze the uploaded image.

IMPORTANT: If this is NOT a plant image (e.g., it shows a person, animal, object, or non-plant scene), respond with:
{"error": "not_a_plant", "message": "This image does not appear to contain a plant. Please upload a clear photo of a plant or its leaves."}

If it IS a plant image, analyze for diseases and respond ONLY with valid JSON (no markdown, no code blocks) with these exact fields:
{
  "disease": "disease name or 'Healthy Plant'",
  "confidence": 85,
  "severity": "Mild | Moderate | Severe | None",
  "treatment": "specific treatment steps for Karnataka/India climate",
  "prevention": "prevention tips for future"
}`;
  } else if (mode === 'identify') {
    prompt = `You are a botanist. Carefully analyze the uploaded image.

IMPORTANT: If this is NOT a plant image (e.g., it shows a person, animal, object, or non-plant scene), respond with:
{"error": "not_a_plant", "message": "This image does not appear to contain a plant. Please upload a clear photo of a plant."}

If it IS a plant image, identify it and respond ONLY with valid JSON (no markdown, no code blocks) with these exact fields:
{
  "plantName": "Common Name (Scientific Name)",
  "family": "Plant Family",
  "commonNames": "common names, Kannada name if known",
  "careLevel": "Easy | Medium | Hard",
  "description": "brief description and growing tips for Karnataka/Bangalore climate",
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}`;
  } else {
    prompt = `You are a soil science expert. Carefully analyze the uploaded image.

IMPORTANT: If this is NOT a soil/ground image, respond with:
{"error": "not_soil", "message": "This image does not appear to show soil. Please upload a clear photo of your garden soil."}

If it IS a soil image, analyze it and respond ONLY with valid JSON (no markdown, no code blocks) with these exact fields:
{
  "soilType": "type of soil based on visible color and texture",
  "pH": "estimated pH range",
  "texture": "Sandy | Silty | Clay | Loam | Sandy Clay Loam etc.",
  "nutrients": {"nitrogen": "High | Medium | Low", "phosphorus": "High | Medium | Low", "potassium": "High | Medium | Low"},
  "recommendation": "detailed recommendation for Karnataka gardening",
  "amendments": ["amendment 1", "amendment 2", "amendment 3", "amendment 4"]
}`;
  }

  try {
    const response = await fetch(GEMINI_VISION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: image } }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.json();
      throw new Error(errBody.error?.message || `Gemini API error ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if present
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json(parsed);
      }
      return res.json({ raw: rawText });
    } catch (parseErr) {
      return res.json({ raw: rawText });
    }
  } catch (error) {
    console.error('Gemini vision error:', error.message);
    res.status(503).json({
      error: `Gemini Vision API error: ${error.message}`
    });
  }
});

// --- GEMINI RECIPE GENERATOR ENDPOINT ---
app.post('/api/generate-recipes', async (req, res) => {
  const { ingredients, quantity } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Please select at least one harvested ingredient.' });
  }

  const ingredientsList = ingredients.join(', ');
  const qtyStr = quantity ? `(${quantity})` : '';

  // Fallback recipes if Gemini is not configured
  const mockRecipesFallback = [
    {
      name: `Homegrown ${ingredients[0]} & Herb Chutney`,
      description: "A traditional South Indian condiment bursting with tangy, fresh herbal notes, perfect with warm idlis or dosas.",
      prepTime: "15 mins",
      difficulty: "Easy",
      ingredients: [
        `Freshly harvested ${ingredientsList} ${qtyStr}`,
        "Gritted fresh coconut - 1/2 cup",
        "Green chilies - 2",
        "Mustard seeds & Curry leaves for tempering",
        "Salt to taste"
      ],
      instructions: [
        `Wash the freshly harvested ${ingredients.join(' and ')} thoroughly under cold running water.`,
        "Grind the ingredients with coconut, green chilies, and salt into a smooth paste using a little water.",
        "Heat 1 teaspoon of oil in a small pan. Add mustard seeds and curry leaves until they splutter.",
        "Pour the hot tempering over the ground chutney and mix well. Serve fresh."
      ]
    },
    {
      name: `Contemporary Sprout & ${ingredients[0]} Salad`,
      description: "A crunchy, nutrient-dense contemporary salad combining your homegrown herbs and veggies with seasoned local pulses.",
      prepTime: "10 mins",
      difficulty: "Easy",
      ingredients: [
        `Harvested ${ingredientsList}`,
        "Sprouted green gram (Moong) - 1 cup",
        "Lemon juice - 1 tbsp",
        "Chaad masala - 1/2 tsp",
        "Roasted peanuts - 2 tbsp"
      ],
      instructions: [
        "Chop your freshly harvested ingredients finely.",
        "In a bowl, combine sprouted green gram with the chopped vegetables/herbs.",
        "Drizzle fresh lemon juice and sprinkle chaat masala over the salad.",
        "Toss gently, garnish with crunchy roasted peanuts, and enjoy immediately."
      ]
    },
    {
      name: `South Indian Spiced Rasam with Fresh ${ingredients[0]}`,
      description: "A comforting, peppery South Indian soup infused with the rich essence of homegrown produce, best enjoyed piping hot.",
      prepTime: "20 mins",
      difficulty: "Medium",
      ingredients: [
        `Harvested ${ingredientsList}`,
        "Tamarind pulp - 1 tbsp",
        "Rasam powder - 1 tbsp",
        "Crushed black pepper & Cumin - 1 tsp",
        "Ghee - 1 tsp",
        "A pinch of asafoetida (Hing)"
      ],
      instructions: [
        "Boil tamarind pulp in 2 cups of water with salt and turmeric.",
        "Mash and add your homegrown tomatoes/herbs into the simmering tamarind water.",
        "Stir in the rasam powder, pepper, and cumin. Simmer until frothy (do not boil excessively).",
        "Heat ghee in a ladle, temper with mustard seeds and hing, then pour into the hot rasam."
      ]
    }
  ];

  if (!GEMINI_API_KEY) {
    console.log('No GEMINI_API_KEY configured. Returning high-quality simulated recipes.');
    return res.json({ recipes: mockRecipesFallback });
  }

  try {
    const systemInstruction = `You are a professional culinary chef specializing in South Indian (Karnataka, Tamil Nadu, Andhra) and contemporary organic fusion cuisines. You focus on utilizing fresh, home-grown ingredients. You respond ONLY with a valid JSON object containing a "recipes" key which is an array of exactly 3 recipes. Do not wrap in markdown code blocks like \`\`\`json. Each recipe object must have these exact keys: "name", "description", "prepTime", "difficulty", "ingredients" (array of strings), and "instructions" (array of strings).`;

    const prompt = `The user has just harvested ${quantity || 'some'} of fresh home-grown ${ingredientsList}. Generate 3 authentic South Indian or contemporary recipes utilizing these ingredients. Make them delicious, healthy, and highlight the fresh flavors.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean code fences if the model ignored responseMimeType
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.recipes)) {
        return res.json(parsed);
      } else if (Array.isArray(parsed)) {
        return res.json({ recipes: parsed });
      }
      throw new Error("Invalid structure returned");
    } catch (parseErr) {
      console.warn("Could not parse AI response, using fallback recipes:", parseErr.message, rawText);
      return res.json({ recipes: mockRecipesFallback });
    }
  } catch (error) {
    console.error('Gemini recipe generation error:', error.message);
    res.json({ recipes: mockRecipesFallback });
  }
});

// --- PLANT CRUD ENDPOINTS ---
app.post('/api/plants', async (req, res) => {
  const { userId, plantName, species, wateringFrequencyDays } = req.body;
  try {
    const { data, error } = await supabase.from('user_plants').insert([{
      user_id: userId,
      plant_name: plantName,
      species: species || null,
      watering_frequency_days: wateringFrequencyDays || 2,
      last_watered: new Date().toISOString(),
      health_status: 'Good'
    }]).select();
    if (error) throw error;
    res.json({ success: true, plant: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/plants/:id/water', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('user_plants')
      .update({ last_watered: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json({ success: true, plant: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/plants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('user_plants').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CRON JOB FOR PLANT REMINDERS ---
// Check every morning at 7:00 AM
cron.schedule('0 7 * * *', async () => {
  console.log('Running daily watering reminder check at 7 AM...');
  
  try {
    const { data: plants, error } = await supabase
      .from('user_plants')
      .select('id, user_id, plant_name, watering_frequency_days, last_watered, profiles(email, full_name, email_notifications_enabled)');
      
    if (error) throw error;
    if (!plants) return;

    const today = new Date();
    const urgentPlants = plants.filter(plant => {
      if (!plant.last_watered) return true;
      const nextDate = new Date(plant.last_watered);
      nextDate.setDate(nextDate.getDate() + plant.watering_frequency_days);
      return nextDate <= today;
    });

    console.log(`Found ${urgentPlants.length} plants needing water today.`);

    const userReminders = {};
    urgentPlants.forEach(plant => {
      const profile = plant.profiles;
      if (profile && profile.email_notifications_enabled && profile.email) {
        if (!userReminders[profile.email]) {
          userReminders[profile.email] = {
            name: profile.full_name || 'Gardener',
            plants: []
          };
        }
        userReminders[profile.email].plants.push(plant.plant_name);
      }
    });

    for (const [email, info] of Object.entries(userReminders)) {
      try {
        const plantListHtml = info.plants.map(p => `<li><strong>${p}</strong></li>`).join('');
        await resend.emails.send({
          from: 'UrbanRoots <onboarding@resend.dev>',
          to: email,
          subject: `🌱 Watering Reminder: Your plants need attention!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #10b981;">Hello, ${info.name}!</h2>
              <p>This is a quick watering reminder for your UrbanRoots smart garden. The following plants are due (or overdue) for watering or nutrient replenishment:</p>
              <ul style="font-size: 16px; line-height: 1.5; color: #334155;">
                ${plantListHtml}
              </ul>
              <p>Please log in to your dashboard to mark them as watered and keep your grow logs updated.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8;">You are receiving this because you signed up for watering email reminders on UrbanRoots. You can opt out in your Profile settings.</p>
            </div>
          `
        });
        console.log(`Sent reminder email to ${email}`);
      } catch (emailErr) {
        console.error(`Failed to send reminder email to ${email}:`, emailErr.message);
      }
    }
  } catch (err) {
    console.error('Error in cron job:', err);
  }
});

// --- PUSH NOTIFICATION SUB SERVICE ---
app.post('/api/push/subscribe', async (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription) {
    return res.status(400).json({ error: 'Missing userId or subscription data' });
  }

  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription_json: subscription
      }, { onConflict: 'user_id' })
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RAZORPAY PAYMENT (PAUSED) ---
/*
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = req.body;
  
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                                  .update(body.toString())
                                  .digest('hex');
                                  
  if (expectedSignature === razorpay_signature) {
    const { data, error } = await supabase
      .from('orders')
      .insert([{ 
        user_id: userId, 
        razorpay_order_id, 
        razorpay_payment_id, 
        total_amount_inr: amount, 
        status: 'paid' 
      }]);
      
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, message: 'Payment verified successfully', order: data });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});
*/

// --- EXPERT BOOKING & RESEND EMAILS ---
app.post('/api/book-expert', async (req, res) => {
  const { userId, expertName, date, time, type, issue, userEmail } = req.body;
  
  try {
    // 1. Save booking to Supabase
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: userId,
        expert_name: expertName,
        expert_id: 1, // Mock
        booking_date: date,
        booking_time: time,
        consultation_type: type,
        problem_description: issue,
        status: 'confirmed'
      }])
      .select();

    if (error) throw error;

    // 2. Send email via Resend API
    if (userEmail) {
      await resend.emails.send({
        from: 'UrbanRoots <onboarding@resend.dev>',
        to: userEmail,
        subject: `Booking Confirmed: ${expertName}`,
        html: `<p>Your UrbanRoots ${type} consultation with ${expertName} is confirmed for ${date} at ${time}.</p><p>Issue: ${issue}</p>`
      });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', using: 'Gemini API' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`UrbanRoots Backend running on port ${PORT}`);
  console.log(`Gemini Vision & Chat active (API key configured: ${!!GEMINI_API_KEY})`);
});
