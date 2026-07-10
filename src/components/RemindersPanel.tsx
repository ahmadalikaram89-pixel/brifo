import { X, CalendarClock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { isolateBidiRuns } from '../lib/bidiText';
import './RemindersPanel.css';

interface RemindersPanelProps {
  onClose: () => void;
}

export function RemindersPanel({ onClose }: RemindersPanelProps) {
  const { t } = useLanguage();
  const { children, events } = useData();

  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => e.date >= today && e.date <= horizon)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  function childFor(childId: string) {
    return children.find((c) => c.id === childId);
  }

  return (
    <>
      <div className="reminders-backdrop" onClick={onClose} />
      <div className="reminders-panel card">
        <div className="reminders-panel-head">
          <h3>{t('reminders_panel_title')}</h3>
          <button className="reminders-close" onClick={onClose} aria-label={t('back')}>
            <X size={18} strokeWidth={2.25} />
          </button>
        </div>

        {upcoming.length === 0 ? (
          <div className="reminders-empty">
            <CalendarClock size={22} strokeWidth={2} />
            <p>{t('reminders_empty')}</p>
          </div>
        ) : (
          <div className="reminders-list">
            {upcoming.map((e) => {
              const child = childFor(e.childId);
              return (
                <div className="reminders-item" key={e.id}>
                  <span className="reminders-date nums">{e.date === today ? t('reminders_today') : e.date}</span>
                  <div className="reminders-item-info">
                    <h4>{isolateBidiRuns(e.title)}</h4>
                    <p>{isolateBidiRuns(child ? child.name : t('assign_all_children'))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
