import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { LogOut, MapPin, Calendar, Leaf, Settings, ShoppingBag, BookOpen, Award, Edit3, Camera, Zap } from 'lucide-react';
import { getGamificationState, calculateLevel } from '../utils/gamification';
import './Profile.css';

const Profile = () => {
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myPlants, setMyPlants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ plants: 0, bookings: 0, posts: 0 });
  const [gamState, setGamState] = useState({
    xp: 0,
    streak: 0,
    badges: [],
    last_active_date: null
  });

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        // Fetch user plants
        const { data: plantsData } = await supabase
          .from('user_plants')
          .select('*')
          .eq('user_id', user.id);
        if (plantsData) setMyPlants(plantsData);

        // Fetch gamification state
        const gs = await getGamificationState(user.id);
        setGamState(gs);

        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (bookingsData) setBookings(bookingsData);

        // Fetch orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (ordersData) setOrders(ordersData);

        // Fetch posts count from DB
        const { count: postsCount } = await supabase
          .from('community_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats({
          plants: plantsData?.length || 0,
          bookings: bookingsData?.length || 0,
          posts: postsCount || 0
        });

        // Prepopulate edit fields
        if (profile) {
          setEditName(profile.full_name || '');
          setEditCity(profile.city || 'Bangalore');
          setNotificationsEnabled(profile.email_notifications_enabled !== false);
          setAvatarPreview(profile.avatar_url || '');
        }
      } catch (err) {
        console.warn('Could not fetch profile data:', err);
      }
    };

    fetchData();
  }, [user, profile, isAuthenticated]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let publicAvatarUrl = avatarPreview;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        publicAvatarUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName,
          city: editCity,
          avatar_url: publicAvatarUrl,
          email_notifications_enabled: notificationsEnabled
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setIsEditing(false);
      // Reload profile
      window.location.reload();
    } catch (err) {
      console.error('Error updating profile:', err.message);
      alert('Failed to update profile: ' + err.message + '\nNote: Please verify that a public Supabase storage bucket named "avatars" has been created.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-page page-transition">
        <div className="profile-empty">
          <span className="profile-empty-emoji">🌱</span>
          <h2>Welcome to UrbanRoots</h2>
          <p>Sign in to track your plants, book experts, and join the community.</p>
          <button className="btn-primary" onClick={() => navigate('/auth')}>
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="profile-page page-transition">
      {/* Profile Header */}
      <section className="profile-header-section">
        <div className="profile-avatar-large">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Profile" className="profile-avatar-img" />
          ) : (
            <span>🌿</span>
          )}
        </div>
        
        {!isEditing ? (
          <>
            <h1 className="profile-name">{profile?.full_name || 'Gardener'}</h1>
            <div className="profile-meta-row">
              {profile?.city && (
                <span className="profile-meta-item">
                  <MapPin size={14} /> {profile.city}, KA
                </span>
              )}
              <span className="profile-meta-item">
                <Calendar size={14} /> Joined {memberSince}
              </span>
            </div>
            
            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
              <Edit3 size={14} /> Edit Profile
            </button>
          </>
        ) : (
          <form className="edit-profile-form glass-card" onSubmit={handleProfileSave}>
            <div className="edit-avatar-group">
              <label htmlFor="avatar-file" className="avatar-input-label">
                <Camera size={14} style={{ marginRight: '6px' }} />
                Change Avatar Image
              </label>
              <input
                type="file"
                id="avatar-file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="form-group-profile">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
            </div>

            <div className="form-group-profile">
              <label>City</label>
              <select value={editCity} onChange={e => setEditCity(e.target.value)}>
                <option value="Bangalore">Bangalore</option>
                <option value="Mysore">Mysore</option>
                <option value="Mangalore">Mangalore</option>
                <option value="Hubli">Hubli</option>
                <option value="Dharwad">Dharwad</option>
                <option value="Belgaum">Belgaum</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <label className="checkbox-group-profile">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={e => setNotificationsEnabled(e.target.checked)}
              />
              <span>Enable Daily Email Reminders</span>
            </label>

            <div className="edit-actions-row">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => { setIsEditing(false); setAvatarPreview(profile?.avatar_url || ''); }}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Stats */}
      <section className="profile-stats-row">
        <div className="profile-stat">
          <Leaf size={20} className="stat-icon" />
          <div>
            <span className="stat-number">{stats.plants}</span>
            <span className="stat-label">Plants</span>
          </div>
        </div>
        <div className="profile-stat">
          <BookOpen size={20} className="stat-icon" />
          <div>
            <span className="stat-number">{stats.bookings}</span>
            <span className="stat-label">Bookings</span>
          </div>
        </div>
        <div className="profile-stat">
          <Award size={20} className="stat-icon" />
          <div>
            <span className="stat-number">{stats.posts}</span>
            <span className="stat-label">Posts</span>
          </div>
        </div>
      </section>

      {/* Gardener Achievement Hub */}
      <section className="profile-section gamification-hub-section">
        <h2 className="profile-section-title">🏆 Gardener Achievement Hub</h2>
        <div className="glass-card gamification-hud-card">
          <div className="xp-level-row">
            <div className="level-badge-large">
              <span>LVL</span>
              <strong>{calculateLevel(gamState.xp)}</strong>
            </div>
            
            <div className="xp-details-block">
              <div className="xp-labels">
                <h4>Rank: {calculateLevel(gamState.xp) >= 5 ? '🌿 Master Botanist' : calculateLevel(gamState.xp) >= 3 ? '🌱 Elite Cultivator' : '🪴 Novice Sprouter'}</h4>
                <span className="xp-numerical">{gamState.xp % 100} / 100 XP</span>
              </div>
              <div className="xp-progress-bar-container">
                <div className="xp-progress-bar" style={{ width: `${gamState.xp % 100}%` }}></div>
              </div>
              <p className="xp-next-level-label">Earn {100 - (gamState.xp % 100)} more XP to level up!</p>
            </div>
            
            <div className="streak-hud-block">
              <span className="streak-fire-emoji">🔥</span>
              <div className="streak-desc-box">
                <strong>{gamState.streak} Day Streak</strong>
                <span>Active Care Day</span>
              </div>
            </div>
          </div>

          <div className="badges-achievements-divider"></div>

          <h3 className="achievements-sub-title">My Digital Badges / Milestones</h3>
          <div className="digital-badges-grid">
            {[
              { id: 'monsoon_master', name: 'Monsoon Master', emoji: '🌧️', desc: 'Maintain a 5+ day consecutive plant care streak.' },
              { id: 'hydro_hero', name: 'Hydroponic Hero', emoji: '⚡', desc: 'Deploy at least 2 hydroponic or vertical systems.' },
              { id: 'photo_journalist', name: 'Photo Journalist', emoji: '📸', desc: 'Log 3+ growth logs in the Plant Photo Journal.' },
              { id: 'ecoscore_elite', name: 'Eco-Score Elite', emoji: '🏆', desc: 'Achieve an A+ Rating on the Yield Simulator.' },
              { id: 'wicking_wizard', name: 'Wicking Wizard', emoji: '🧙‍♂️', desc: 'List or swap gardening items on the Barter Swap.' }
            ].map(badge => {
              const isUnlocked = gamState.badges.includes(badge.id);
              return (
                <div key={badge.id} className={`badge-item-hud ${isUnlocked ? 'unlocked' : 'locked'}`} title={badge.desc}>
                  <div className="badge-emoji-box-hud">
                    <span className="badge-emoji-hud">{badge.emoji}</span>
                    {!isUnlocked && <span className="lock-icon-hud">🔒</span>}
                  </div>
                  <h4>{badge.name}</h4>
                  <p>{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* My Plants Quick View */}
      <section className="profile-section">
        <h2 className="profile-section-title">My Plants</h2>
        {myPlants.length > 0 ? (
          <div className="profile-plants-list">
            {myPlants.slice(0, 4).map(plant => (
              <div key={plant.id} className="profile-plant-item">
                <span className="profile-plant-emoji">🪴</span>
                <div>
                  <h4>{plant.plant_name}</h4>
                  <span className="profile-plant-status">{plant.health_status || 'Good'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-empty-text">No plants added yet. Go to the Dashboard to add your first plant!</p>
        )}
      </section>

      {/* Order History View */}
      <section className="profile-section">
        <h2 className="profile-section-title">Purchase History</h2>
        {orders.length > 0 ? (
          <div className="profile-orders-list">
            {orders.map(order => (
              <div key={order.id} className="profile-order-item">
                <div className="order-header-line">
                  <span>Order Reference</span>
                  <span className="order-amount">₹{order.total_amount_inr}</span>
                </div>
                <div className="order-header-line">
                  <span className="booking-date-text">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                  <span className={`order-status ${order.status}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-empty-text">No purchases yet. Visit the Marketplace to explore our gardening catalog.</p>
        )}
      </section>

      {/* Recent Bookings */}
      <section className="profile-section">
        <h2 className="profile-section-title">Recent Bookings</h2>
        {bookings.length > 0 ? (
          <div className="profile-bookings-list">
            {bookings.map(b => (
              <div key={b.id} className="profile-booking-item">
                <div>
                  <h4>{b.expert_name}</h4>
                  <span className="booking-date-text">{b.booking_date} at {b.booking_time}</span>
                </div>
                <span className={`booking-status-badge ${b.status}`}>{b.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-empty-text">No bookings yet. Visit the Experts page to book a consultation.</p>
        )}
      </section>

      {/* Actions */}
      <section className="profile-actions">
        <button className="profile-action-btn danger" onClick={handleSignOut}>
          <LogOut size={18} /> Sign Out
        </button>
      </section>
    </div>
  );
};

export default Profile;
