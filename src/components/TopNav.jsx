import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, ShoppingCart, User, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './TopNav.css';

const TopNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();

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

  const notifications = [
    { id: 1, text: "Water your Tomato plant — Overdue!", type: "urgent", color: "red" },
    { id: 2, text: "Fertilize Tulsi this Friday", type: "warning", color: "yellow" },
    { id: 3, text: "Your Moringa order has been shipped", type: "success", color: "green" },
    { id: 4, text: "Expert booking confirmed for Saturday", type: "info", color: "blue" }
  ];

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
                <span className="badge bell-badge">{notifications.length}</span>
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
