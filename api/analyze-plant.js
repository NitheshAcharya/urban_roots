import { GEMINI_VISION_URL, GEMINI_API_KEY, cors } from './_utils.js';

const PROMPTS = {
  disease: `You are an expert plant pathologist. Analyze this plant image and provide a diagnosis in JSON format:
{
  "disease": "name of the disease or 'Healthy'",
  "confidence": "high/medium/low",
  "symptoms": ["list", "of", "visible", "symptoms"],
  "treatment": ["step 1", "step 2"],
  "prevention": ["tip 1", "tip 2"],
  "severity": "mild/moderate/severe/none"
}`,
  identify: `You are an expert botanist. Identify this plant from the image and respond in JSON format:
{
  "commonName": "common name",
  "scientificName": "scientific name",
  "family": "plant family",
  "confidence": "high/medium/low",
  "description": "brief description",
  "careLevel": "easy/moderate/hard",
  "wateringNeeds": "low/medium/high",
  "sunlightNeeds": "full sun/partial shade/shade",
  "kannadaName": "Kannada name if known or null"
}`,
  soil: `You are an expert agronomist. Analyze this soil image and respond in JSON format:
{
  "soilType": "type of soil",
  "texture": "sandy/loamy/clayey/silty",
  "colorAnalysis": "description of soil color and what it indicates",
  "estimatedPH": "acidic/neutral/alkaline",
  "organicMatter": "low/medium/high",
  "suitablePlants": ["plant 1", "plant 2", "plant 3"],
  "recommendations": ["improvement tip 1", "improvement tip 2"]
}`,
};

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mode = 'disease' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = PROMPTS[mode] || PROMPTS.disease;

    // Extract base64 data and mime type
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (matches) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const geminiResponse = await fetch(GEMINI_VISION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      console.error('Gemini Vision error:', errBody);
      return res.status(502).json({ error: 'Failed to analyze image' });
    }

    const data = await geminiResponse.json();
    const textResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Extract JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : textResponse.trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { rawResponse: textResponse };
    }

    return res.status(200).json({ analysis: parsed, mode });
  } catch (error) {
    console.error('Analyze plant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
