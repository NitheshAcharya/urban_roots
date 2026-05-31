import { useState, useEffect } from 'react';
import { Award, Sparkles, TrendingUp, Zap } from 'lucide-react';
import './GamificationToasts.css';

export default function GamificationToasts() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleXpAwarded = (e) => {
      const { amount, actionName, newLevel, leveledUp } = e.detail;
      const id = `xp-${Date.now()}-${Math.random()}`;

      setToasts((prev) => [
        ...prev,
        {
          id,
          type: 'xp',
          title: `+${amount} XP`,
          subtitle: actionName,
          leveledUp,
          newLevel
        }
      ]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    const handleBadgeUnlocked = (e) => {
      const { name, emoji, desc } = e.detail;
      const id = `badge-${Date.now()}-${Math.random()}`;

      setToasts((prev) => [
        ...prev,
        {
          id,
          type: 'badge',
          title: `🏆 Badge Unlocked: ${name}`,
          subtitle: desc,
          emoji
        }
      ]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    window.addEventListener('xp-awarded', handleXpAwarded);
    window.addEventListener('badge-unlocked', handleBadgeUnlocked);

    return () => {
      window.removeEventListener('xp-awarded', handleXpAwarded);
      window.removeEventListener('badge-unlocked', handleBadgeUnlocked);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="gamification-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`gamification-toast glass-card ${toast.type} ${toast.leveledUp ? 'level-up-toast' : ''}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.type === 'xp' ? (
            <div className="toast-content-wrapper">
              <div className="toast-icon-box xp">
                {toast.leveledUp ? <Sparkles size={20} className="text-yellow animate-spin-slow" /> : <TrendingUp size={18} />}
              </div>
              <div className="toast-text-box">
                <h4 className="toast-title text-green">{toast.title}</h4>
                <p className="toast-subtitle">{toast.subtitle}</p>
                {toast.leveledUp && (
                  <div className="level-up-notice">
                    <Zap size={12} className="text-yellow" />
                    <span>Leveled Up! You are now <strong>Level {toast.newLevel}</strong></span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="toast-content-wrapper">
              <div className="toast-icon-box badge">
                <span className="toast-emoji-badge">{toast.emoji}</span>
              </div>
              <div className="toast-text-box">
                <h4 className="toast-title text-yellow">{toast.title}</h4>
                <p className="toast-subtitle">{toast.subtitle}</p>
              </div>
            </div>
          )}
          <button className="toast-close-btn" onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}>
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
