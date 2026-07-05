import { useState } from 'react';
import { CalendarX2 } from 'lucide-react';
import { TabLayout } from '../components/TabLayout';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ALL_CHILDREN } from '../types/data';
import { isolateBidiRuns } from '../lib/bidiText';
import './Calendar.css';

const SOURCE_LABEL_KEY = {
  letter: 'calendar_source_letter',
  payment: 'calendar_source_payment',
  manual: 'calendar_source_manual',
} as const;

export function Calendar() {
  const { t } = useLanguage();
  const { children, events, addManualEvent } = useData();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [childId, setChildId] = useState<string>(ALL_CHILDREN);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => e.date >= today)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  function childFor(id: string) {
    return children.find((c) => c.id === id);
  }

  function submit() {
    if (!title.trim() || !date) return;
    addManualEvent(childId, title.trim(), date);
    setTitle('');
    setDate('');
    setChildId(ALL_CHILDREN);
    setShowForm(false);
  }

  return (
    <TabLayout>
      <Header />
      <div className="sec">
        <h3>{t('screen_calendar')}</h3>
        <a onClick={() => setShowForm((v) => !v)}>{t('calendar_add_event')}</a>
      </div>

      {showForm && (
        <div className="card event-form">
          <div className="field">
            <label>{t('calendar_event_title_label')}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('calendar_event_title_placeholder')} />
          </div>
          <div className="field">
            <label>{t('calendar_event_date_label')}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('calendar_event_child_label')}</label>
            <select value={childId} onChange={(e) => setChildId(e.target.value)}>
              <option value={ALL_CHILDREN}>{t('assign_all_children')}</option>
              {children.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name} ({c.schoolClass})
                </option>
              ))}
            </select>
          </div>
          <div className="event-form-actions">
            <button className="scan-btn" onClick={() => setShowForm(false)}>
              {t('cancel')}
            </button>
            <button className="scan-btn primary" onClick={submit}>
              {t('save')}
            </button>
          </div>
        </div>
      )}

      {upcoming.length === 0 ? (
        <div className="empty-state actionable" onClick={() => setShowForm(true)}>
          <div className="empty-state-icon">
            <CalendarX2 size={26} strokeWidth={2} />
          </div>
          <p>{t('calendar_no_events')}</p>
        </div>
      ) : (
        <div className="calendar-list">
          {upcoming.map((e) => {
            const child = childFor(e.childId);
            return (
              <div className="card calendar-row" key={e.id}>
                <span className="calendar-dot" style={{ background: child?.color ?? 'var(--muted)' }} />
                <div className="calendar-info">
                  <h4>{isolateBidiRuns(e.title)}</h4>
                  <p>
                    <span className="nums">{e.date}</span> ·{' '}
                    {isolateBidiRuns(child ? `${child.name} (${child.schoolClass})` : t('assign_all_children'))}
                  </p>
                </div>
                <span className="calendar-source">{t(SOURCE_LABEL_KEY[e.source])}</span>
              </div>
            );
          })}
        </div>
      )}
    </TabLayout>
  );
}
