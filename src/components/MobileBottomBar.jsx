import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, ShoppingBag, MessageSquare, User } from 'lucide-react';
import './MobileBottomBar.css';

const MobileBottomBar = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Encyclopedia', path: '/encyclopedia', icon: BookOpen },
    { name: 'Market', path: '/market', icon: ShoppingBag },
    { name: 'Community', path: '/community', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <div className="mobile-bottom-bar">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <Link key={tab.name} to={tab.path} className={`tab-item ${isActive ? 'active' : ''}`}>
            <Icon size={24} className={`tab-icon ${isActive ? 'active-icon' : ''}`} />
            <span className="tab-label">{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileBottomBar;
