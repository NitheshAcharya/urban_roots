import { supabase, cors } from '../../_utils.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Plant id is required' });
    }

    const { data, error } = await supabase
      .from('user_plants')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to delete plant' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    return res.status(200).json({ message: 'Plant deleted successfully' });
  } catch (error) {
    console.error('Delete plant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
