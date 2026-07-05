import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, BookOpen, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './BottomNav.css';

const items = [
  { to: '/', Icon: Home, key: 'nav_home' as const },
  { to: '/calendar', Icon: CalendarDays, key: 'nav_calendar' as const },
  { to: '/guide', Icon: BookOpen, key: 'nav_guide' as const },
  { to: '/settings', Icon: Settings, key: 'nav_settings' as const },
];

export function BottomNav() {
  const { t } = useLanguage();

  return (
    <nav className="brifo-nav">
      <div className="nav-in">
        {items.map(({ to, Icon, key }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `ni${isActive ? ' on' : ''}`}>
            <Icon className="e" size={23} strokeWidth={2.25} />
            {t(key)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
