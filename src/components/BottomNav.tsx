import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './BottomNav.css';

const items = [
  { to: '/', emoji: '🏠', key: 'nav_home' as const },
  { to: '/calendar', emoji: '📅', key: 'nav_calendar' as const },
  { to: '/guide', emoji: '📚', key: 'nav_guide' as const },
  { to: '/settings', emoji: '⚙️', key: 'nav_settings' as const },
];

export function BottomNav() {
  const { t } = useLanguage();

  return (
    <nav className="brifo-nav">
      <div className="nav-in">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `ni${isActive ? ' on' : ''}`}
          >
            <span className="e">{item.emoji}</span>
            {t(item.key)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
