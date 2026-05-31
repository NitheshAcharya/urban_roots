import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, ShoppingCart, User, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import './TopNav.css';

const TopNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Encyclopedia', path: '/encyclopedia' },
    { name: 'Yield Calc', path: '/yield-calculator' },
    { name: 'Calendar', path: '/planting-calendar' },
    { name: 'Market', path: '/market' },
    { name: 'Experts', path: '/experts' },
    { name: 'AI Tools', path: '/ai-tools' },
    { name: 'Community', path: '/community' },
    { name: 'Nurseries', path: '/nurseries' }
  ];

  const baseNotifications = [
    { id: 'n-order', text: "Your Moringa order has been shipped 📦", type: "success", color: "green" },
    { id: 'n-expert', text: "Expert booking confirmed for this Saturday 👨‍🌾", type: "info", color: "blue" }
  ];

  const getPlantEmoji = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('lettuce')) return '🥬';
    if (lower.includes('strawberry')) return '🍓';
    if (lower.includes('kale')) return '🥬';
    if (lower.includes('tomato')) return '🍅';
    if (lower.includes('tulsi') || lower.includes('basil')) return '🌿';
    if (lower.includes('aloe')) return '🪴';
    if (lower.includes('mint')) return '🌿';
    return '🌱';
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!isAuthenticated) {
          // Guest User Alerts
          setNotifications([
            { id: 'guest-cta', text: "Sign in to track your crops & tasks 🔐", type: "info", color: "blue" },
            ...baseNotifications
          ]);
          return;
        }

        const { data, error } = await supabase
          .from('user_plants')
          .select('*')
          .eq('user_id', user?.id);

        if (error) throw error;

        // Check if user has bookings as well
        let userBookings = [];
        try {
          if (user?.id) {
            const { data: bData } = await supabase
              .from('bookings')
              .select('*')
              .eq('user_id', user.id)
              .gte('date', new Date().toISOString().split('T')[0])
              .limit(1);
            if (bData && bData.length > 0) {
              userBookings.push({
                id: `b-${bData[0].id}`,
                text: `Expert booking with ${bData[0].expert_name} confirmed for ${bData[0].date} 👨‍🌾`,
                type: 'info',
                color: 'blue'
              });
            }
          }
        } catch (errBooking) {
          console.warn('Booking subquery failed, skipping booking alerts:', errBooking);
        }

        if (data && data.length > 0) {
          const alerts = [];
          data.forEach(p => {
            if (!p.last_watered) return;
            const next = new Date(p.last_watered);
            next.setDate(next.getDate() + p.watering_frequency_days);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            next.setHours(0, 0, 0, 0);
            
            const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
            const emoji = getPlantEmoji(p.plant_name);
            if (diffDays < 0) {
              alerts.push({
                id: `p-${p.id}`,
                text: `Water your ${p.plant_name} plant — Overdue! ${emoji}`,
                type: 'urgent',
                color: 'red'
              });
            } else if (diffDays === 0) {
              alerts.push({
                id: `p-${p.id}`,
                text: `Water your ${p.plant_name} plant — Due today ${emoji}`,
                type: 'warning',
                color: 'yellow'
              });
            }
          });

          const combined = [
            ...alerts,
            ...userBookings,
            ...baseNotifications.filter(b => b.id !== 'n-expert' || userBookings.length === 0)
          ];

          if (alerts.length === 0) {
            combined.unshift({
              id: 'p-optimal',
              text: "All grow loops are running optimally! 🌿",
              type: 'success',
              color: 'green'
            });
          }

          setNotifications(combined);
        } else {
          // Authenticated but has 0 plants!
          setNotifications([
            { id: 'no-plants', text: "No active plants. Deploy a crop to start tracking! 🌿", type: "info", color: "blue" },
            ...userBookings,
            ...baseNotifications.filter(b => b.id !== 'n-expert' || userBookings.length === 0)
          ]);
        }
      } catch (err) {
        console.warn('Failed to load navigation alerts:', err);
        setNotifications([
          { id: 'error-alerts', text: "System connection running slow. Try reloading! ⚡", type: "info", color: "yellow" },
          ...baseNotifications
        ]);
      }
    };

    fetchNotifications();
    
    // Subscribe to changes in user_plants to update notifications dynamically
    let subscription;
    if (isAuthenticated && user?.id) {
      subscription = supabase
        .channel('public:user_plants')
        .on('postgres_changes', { event: '*', filter: `user_id=eq.${user.id}`, schema: 'public', table: 'user_plants' }, () => {
          fetchNotifications();
        })
        .subscribe();
    }
    
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user, isAuthenticated]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="top-nav-container">
        <div className="top-nav">
          
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <Menu size={24} color="var(--color-text-primary)" />
          </button>

          <Link to="/" className="brand-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="logo-emoji">🌱</span>
            <span className="logo-text">UrbanRoots</span>
          </Link>

          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <button className="action-btn theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={20} color="var(--color-text-primary)" /> : <Sun size={20} color="var(--color-text-primary)" />}
            </button>

            <Link to="/profile" className="action-btn">
              <User size={20} color="var(--color-text-primary)" />
            </Link>

            <button className="action-btn cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={20} color="var(--color-text-primary)" />
              {cartCount > 0 && <span className="badge cart-badge">{cartCount}</span>}
            </button>
            
            <div className="notification-wrapper">
              <button className="action-btn bell-btn" onClick={toggleNotifications}>
                <Bell size={20} color="var(--color-text-primary)" />
                {notifications.filter(n => n.type === 'urgent' || n.type === 'warning').length > 0 && (
                  <span className="badge bell-badge">
                    {notifications.filter(n => n.type === 'urgent' || n.type === 'warning').length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="notifications-dropdown page-transition">
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                  </div>
                  <div className="notifications-list hide-scrollbar">
                    {notifications.map(notif => (
                      <div key={notif.id} className="notification-item" style={{ borderLeftColor: `var(--color-${notif.color})`}}>
                        <p>{notif.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="brand-logo">
            <span className="logo-emoji">🌱</span>
            <span className="logo-text">UrbanRoots</span>
          </div>
          <button className="close-drawer-btn" onClick={toggleMobileMenu}>
            <X size={24} color="var(--color-text-primary)" />
          </button>
        </div>
        <nav className="mobile-nav-links">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      
      {isMobileMenuOpen && (
        <div className="drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </>
  );
};

export default TopNav;
