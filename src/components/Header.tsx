import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { RemindersPanel } from './RemindersPanel';
import './Header.css';

export function Header() {
  const { t } = useLanguage();
  const { events } = useData();
  const [showReminders, setShowReminders] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const upcomingCount = events.filter((e) => e.date >= today && e.date <= horizon).length;

  return (
    <header className="brifo-header">
      <div className="brand">
        <img className="logo" src="/icons/logo-header.png" alt="" width={40} height={40} />
        <div className="brand-name" dir="ltr">
          Bri<span>fo</span>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <button className="bell" aria-label={t('notifications_label')} onClick={() => setShowReminders((v) => !v)}>
          <Bell size={20} strokeWidth={2.25} />
          {upcomingCount > 0 && <i />}
        </button>
        {showReminders && <RemindersPanel onClose={() => setShowReminders(false)} />}
      </div>
    </header>
  );
}
