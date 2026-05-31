import { supabase, cors } from './_utils.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, plantName, species, wateringFrequencyDays } = req.body;

    if (!userId || !plantName) {
      return res.status(400).json({ error: 'userId and plantName are required' });
    }

    const { data, error } = await supabase.from('user_plants').insert([
      {
        user_id: userId,
        plant_name: plantName,
        species: species || null,
        watering_frequency_days: wateringFrequencyDays || 3,
        last_watered: new Date().toISOString(),
      },
    ]).select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create plant' });
    }

    return res.status(201).json({ plant: data[0] });
  } catch (error) {
    console.error('Create plant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
