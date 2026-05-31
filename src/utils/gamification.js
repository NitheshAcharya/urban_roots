import { supabase } from './supabase';

const BADGES_CONFIG = {
  'monsoon_master': { name: 'Monsoon Master', emoji: '🌧️', desc: 'Maintained watering streak during rain alerts' },
  'hydro_hero': { name: 'Hydroponic Hero', emoji: '⚡', desc: 'Deployed at least 2 hydroponic or vertical systems' },
  'photo_journalist': { name: 'Photo Journalist', emoji: '📸', desc: 'Logged 3+ growth photos in the journal' },
  'ecoscore_elite': { name: 'Eco-Score Elite', emoji: '🏆', desc: 'Achieved an A+ rating on the Yield Calculator' },
  'wicking_wizard': { name: 'Wicking Wizard', emoji: '🧙‍♂️', desc: 'Listed or swapped seeds on the P2P barter hub' }
};

// Calculate level based on XP (e.g. 100 XP per level)
export const calculateLevel = (xp) => {
  return Math.floor(xp / 100) + 1;
};

// Retrieve gamification state for a user
export const getGamificationState = async (userId) => {
  const defaultState = {
    xp: 0,
    streak: 0,
    badges: [],
    last_active_date: null
  };

  // Guest user handling
  if (!userId) {
    const local = localStorage.getItem('gamification_guest');
    return local ? JSON.parse(local) : defaultState;
  }

  // Authenticated user: Try Supabase first, fallback to localStorage
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('xp, streak, badges, last_active_date')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Check if the columns exist (in case migration wasn't run)
    if (data && typeof data.xp !== 'undefined' && data.badges !== null) {
      return {
        xp: data.xp || 0,
        streak: data.streak || 0,
        badges: data.badges || [],
        last_active_date: data.last_active_date || null
      };
    }
  } catch (err) {
    console.warn('Supabase gamification fetch failed/unsupported. Using local storage fallback:', err.message);
  }

  // Fallback to local storage keyed by userId
  const local = localStorage.getItem(`gamification_${userId}`);
  return local ? JSON.parse(local) : defaultState;
};

// Save gamification state
export const saveGamificationState = async (userId, state) => {
  if (!userId) {
    localStorage.setItem('gamification_guest', JSON.stringify(state));
    return;
  }

  // Always mirror in localStorage
  localStorage.setItem(`gamification_${userId}`, JSON.stringify(state));

  // Try saving to Supabase profiles
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        xp: state.xp,
        streak: state.streak,
        badges: state.badges,
        last_active_date: state.last_active_date
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (err) {
    console.warn('Supabase gamification save failed/unsupported. Mirrored in localStorage:', err.message);
  }
};

// Award XP to a user
export const awardXP = async (amount, actionName, userId = null) => {
  const state = await getGamificationState(userId);
  const oldLevel = calculateLevel(state.xp);
  
  state.xp += amount;
  const newLevel = calculateLevel(state.xp);
  const leveledUp = newLevel > oldLevel;

  await saveGamificationState(userId, state);

  // Dispatch custom browser event for toast notification
  const xpEvent = new CustomEvent('xp-awarded', {
    detail: {
      amount,
      actionName,
      newXp: state.xp,
      newLevel,
      leveledUp
    }
  });
  window.dispatchEvent(xpEvent);

  return { state, leveledUp, newLevel };
};

// Unlock a digital badge
export const unlockBadge = async (badgeId, userId = null) => {
  const config = BADGES_CONFIG[badgeId];
  if (!config) return null;

  const state = await getGamificationState(userId);
  if (state.badges.includes(badgeId)) {
    return null; // Already unlocked
  }

  state.badges.push(badgeId);
  await saveGamificationState(userId, state);

  // Dispatch badge unlocked event
  const badgeEvent = new CustomEvent('badge-unlocked', {
    detail: {
      badgeId,
      name: config.name,
      emoji: config.emoji,
      desc: config.desc
    }
  });
  window.dispatchEvent(badgeEvent);

  // Award bonus XP for unlocking a badge!
  await awardXP(50, `Unlocked Badge: ${config.name}`, userId);

  return config;
};

// Update streak on user activity
export const updateStreak = async (userId = null) => {
  const state = await getGamificationState(userId);
  const todayStr = new Date().toISOString().split('T')[0];

  if (!state.last_active_date) {
    state.streak = 1;
    state.last_active_date = todayStr;
    await saveGamificationState(userId, state);
    return state.streak;
  }

  const lastActive = new Date(state.last_active_date);
  const today = new Date(todayStr);
  const diffTime = Math.abs(today - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Active on consecutive day: increment streak
    state.streak += 1;
    state.last_active_date = todayStr;
    await saveGamificationState(userId, state);
    
    // Streak milestones bonus XP!
    if (state.streak % 3 === 0) {
      await awardXP(30, `${state.streak}-day care streak!`, userId);
    }
    
    // Streak badges
    if (state.streak >= 5) {
      await unlockBadge('monsoon_master', userId);
    }
  } else if (diffDays > 1) {
    // Broken streak
    state.streak = 1;
    state.last_active_date = todayStr;
    await saveGamificationState(userId, state);
  }

  return state.streak;
};
