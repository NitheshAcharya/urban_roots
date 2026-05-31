import { supabase, cors } from '../_utils.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { data, error } = await supabase
      .from('chat_history')
      .select('user_message, bot_response, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch chat history' });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Chat history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
