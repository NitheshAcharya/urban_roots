import { supabase, resend, cors } from '../_utils.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    // Fetch all plants with user info
    const { data: plants, error: plantsError } = await supabase
      .from('user_plants')
      .select('*, profiles:user_id(email, full_name)');

    if (plantsError) {
      console.error('Supabase error fetching plants:', plantsError);
      return res.status(500).json({ error: 'Failed to fetch plants' });
    }

    if (!plants || plants.length === 0) {
      return res.status(200).json({ message: 'No plants found', reminders: 0 });
    }

    const now = new Date();
    const overduePlants = [];

    // Filter overdue plants
    for (const plant of plants) {
      if (!plant.last_watered || !plant.watering_frequency_days) continue;

      const lastWatered = new Date(plant.last_watered);
      const daysSinceWatered = Math.floor(
        (now - lastWatered) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceWatered >= plant.watering_frequency_days) {
        overduePlants.push({
          ...plant,
          daysSinceWatered,
          daysOverdue: daysSinceWatered - plant.watering_frequency_days,
        });
      }
    }

    if (overduePlants.length === 0) {
      return res.status(200).json({ message: 'No overdue plants', reminders: 0 });
    }

    // Group overdue plants by user email
    const userPlantMap = {};
    for (const plant of overduePlants) {
      const email = plant.profiles?.email;
      if (!email) continue;

      if (!userPlantMap[email]) {
        userPlantMap[email] = {
          name: plant.profiles?.full_name || 'Plant Parent',
          plants: [],
        };
      }
      userPlantMap[email].plants.push(plant);
    }

    let remindersSent = 0;

    // Send email reminders
    for (const [email, userData] of Object.entries(userPlantMap)) {
      const plantRows = userData.plants
        .map(
          (p) =>
            `<tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${p.plant_name}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${p.species || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${p.daysSinceWatered} days ago</td>
              <td style="padding: 8px; border: 1px solid #ddd; color: #e74c3c;">${p.daysOverdue} day(s) overdue</td>
            </tr>`
        )
        .join('');

      try {
        await resend.emails.send({
          from: 'UrbanRoots <onboarding@resend.dev>',
          to: email,
          subject: `💧 Water Reminder — ${userData.plants.length} plant(s) need attention!`,
          html: `
            <h2>🌱 UrbanRoots Watering Reminder</h2>
            <p>Hi ${userData.name},</p>
            <p>The following plants are overdue for watering:</p>
            <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
              <thead>
                <tr style="background: #f0f9f0;">
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Plant</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Species</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Last Watered</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th>
                </tr>
              </thead>
              <tbody>${plantRows}</tbody>
            </table>
            <p>Don't forget to give them some love! 🌿💧</p>
          `,
        });
        remindersSent++;
      } catch (emailError) {
        console.error(`Failed to send reminder to ${email}:`, emailError);
      }
    }

    return res.status(200).json({
      message: `Sent ${remindersSent} watering reminder(s)`,
      reminders: remindersSent,
      overduePlants: overduePlants.length,
    });
  } catch (error) {
    console.error('Water reminder cron error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
