import { useState } from 'react';
import { CalendarX2, Trash2 } from 'lucide-react';
import { TabLayout } from '../components/TabLayout';
import { Header } from '../components/Header';
import { AddToCalendarButton } from '../components/AddToCalendarButton';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ALL_CHILDREN, type CalendarEvent } from '../types/data';
import { isolateBidiRuns } from '../lib/bidiText';
import { colorsForChildId, dotBackground } from '../lib/childColors';
import './Calendar.css';

const SOURCE_LABEL_KEY = {
  letter: 'calendar_source_letter',
  payment: 'calendar_source_payment',
  manual: 'calendar_source_manual',
} as const;

export function Calendar() {
  const { t } = useLanguage();
  const { children, events, addManualEvent, deleteEvent } = useData();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [childId, setChildId] = useState<string>(ALL_CHILDREN);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => e.date >= today)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  const expired = events
    .filter((e) => e.date < today)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  function childFor(id: string) {
    return children.find((c) => c.id === id);
  }

  function renderRow(e: CalendarEvent) {
    const child = childFor(e.childId);
    return (
      <div className="card calendar-row" key={e.id}>
        <span className="calendar-dot" style={{ background: dotBackground(colorsForChildId(e.childId, children)) }} />
        <div className="calendar-info">
          <h4>{isolateBidiRuns(e.title)}</h4>
          <p>
            <span className="nums">{e.date}</span> ·{' '}
            {isolateBidiRuns(
              child ? (child.schoolClass ? `${child.name} (${child.schoolClass})` : child.name) : t('assign_all_children'),
            )}
          </p>
        </div>
        <span className="calendar-source">{t(SOURCE_LABEL_KEY[e.source])}</span>
        <AddToCalendarButton title={e.title} date={e.date} compact />
        <button className="calendar-delete" onClick={() => deleteEvent(e.id)} aria-label={t('calendar_delete_event')}>
          <Trash2 size={16} strokeWidth={2} />
        </button>
      </div>
    );
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
                  {c.schoolClass ? `${c.name} (${c.schoolClass})` : c.name}
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
        <div className="calendar-list">{upcoming.map(renderRow)}</div>
      )}

      {expired.length > 0 && (
        <>
          <div className="sec">
            <h3>{t('calendar_expired_title')}</h3>
          </div>
          <div className="calendar-list">{expired.map(renderRow)}</div>
        </>
      )}
    </TabLayout>
  );
}
