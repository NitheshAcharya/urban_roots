import { supabase, resend, cors } from './_utils.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, expertName, date, time, type, issue, userEmail } = req.body;

    if (!userId || !expertName || !date || !time) {
      return res.status(400).json({
        error: 'userId, expertName, date, and time are required',
      });
    }

    // Insert booking into Supabase
    const { data, error } = await supabase.from('bookings').insert([
      {
        user_id: userId,
        expert_name: expertName,
        date,
        time,
        type: type || 'consultation',
        issue: issue || '',
        user_email: userEmail || '',
        status: 'confirmed',
      },
    ]).select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    // Send confirmation email if userEmail is provided
    if (userEmail) {
      try {
        await resend.emails.send({
          from: 'UrbanRoots <onboarding@resend.dev>',
          to: userEmail,
          subject: `Booking Confirmed — ${expertName}`,
          html: `
            <h2>🌱 UrbanRoots Booking Confirmation</h2>
            <p>Your consultation has been confirmed!</p>
            <table style="border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; font-weight: bold;">Expert:</td><td style="padding: 8px;">${expertName}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td style="padding: 8px;">${date}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Time:</td><td style="padding: 8px;">${time}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Type:</td><td style="padding: 8px;">${type || 'consultation'}</td></tr>
              ${issue ? `<tr><td style="padding: 8px; font-weight: bold;">Issue:</td><td style="padding: 8px;">${issue}</td></tr>` : ''}
            </table>
            <p>Thank you for choosing UrbanRoots! 🌿</p>
          `,
        });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Don't fail the booking if email fails
      }
    }

    return res.status(201).json({ booking: data[0], message: 'Booking confirmed' });
  } catch (error) {
    console.error('Book expert error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
