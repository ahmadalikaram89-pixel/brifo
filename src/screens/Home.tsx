import { useNavigate } from 'react-router-dom';
import { Camera, Plus, PenLine, CheckCircle2, BookOpen } from 'lucide-react';
import { Header } from '../components/Header';
import { TabLayout } from '../components/TabLayout';
import { AddToCalendarButton } from '../components/AddToCalendarButton';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { isolateBidiRuns } from '../lib/bidiText';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { children, letters, payments, events } = useData();

  const today = new Date().toISOString().slice(0, 10);
  const monthPrefix = today.slice(0, 7);

  const monthlyTotal = payments
    .filter((p) => !p.paid && p.dueDate.startsWith(monthPrefix))
    .reduce((sum, p) => sum + p.amount, 0);

  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const recentLetters = letters
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const greeting = children[0]
    ? t('greeting_title_named').replace('{name}', children[0].name)
    : t('greeting_title_generic');

  function childFor(childId: string) {
    return children.find((c) => c.id === childId);
  }

  function upcomingCountFor(childId: string) {
    return events.filter((e) => e.childId === childId && e.date >= today).length;
  }

  function avatarGradient(color: string) {
    return `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color} 55%, white) 100%)`;
  }

  return (
    <TabLayout>
      <Header />

      <div className="greeting">
        <h1>{greeting}</h1>
        <p>{t('greeting_subtitle')}</p>
      </div>

      <div className="children-row">
        {children.map((c) => {
          const count = upcomingCountFor(c.id);
          return (
            <div className="child-card" key={c.id} onClick={() => navigate(`/child/${c.id}`)}>
              <div className="child-card-avatar-wrap">
                <div className="child-card-avatar" style={{ background: avatarGradient(c.color) }}>
                  {c.name.slice(0, 1)}
                </div>
                {count > 0 && (
                  <span className="child-card-badge">
                    <span className="nums">{count}</span> {t('home_deadlines_count')}
                  </span>
                )}
              </div>
              <h4>{isolateBidiRuns(c.name)}</h4>
            </div>
          );
        })}
        <div
          className={`child-card add-card${children.length === 0 ? ' first' : ''}`}
          onClick={() => navigate('/child/new')}
          role="button"
          aria-label={t('home_add_child')}
        >
          <div className="child-card-avatar add-avatar">
            <Plus size={22} strokeWidth={2.5} />
          </div>
          {children.length === 0 && <h4>{t('home_no_children_title')}</h4>}
        </div>
      </div>

      <div className="scan" onClick={() => navigate('/scan')}>
        <div className="cam">
          <Camera size={30} strokeWidth={2} />
        </div>
        <h2>{t('scan_title')}</h2>
        <p>{t('scan_subtitle')}</p>
      </div>

      {monthlyTotal > 0 && (
        <div className="card monthly-total-card">
          <span>{t('home_monthly_total')}</span>
          <b className="nums">{monthlyTotal} €</b>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <>
          <div className="sec">
            <h3>{t('section_deadlines')}</h3>
            <a onClick={() => navigate('/calendar')}>{t('view_all')}</a>
          </div>
          <div className="deadlines">
            {upcomingEvents.map((e) => {
              const child = childFor(e.childId);
              return (
                <div className="dl soon" key={e.id}>
                  <div className="dl-top">
                    <span className="when nums">{e.date}</span>
                    <AddToCalendarButton title={e.title} date={e.date} compact />
                  </div>
                  <h4>{isolateBidiRuns(e.title)}</h4>
                  <p>
                    {child && <span className="child-dot" style={{ background: child.color }} />}
                    {isolateBidiRuns(child ? `${child.name} · ${child.schoolClass}` : t('assign_all_children'))}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {recentLetters.length > 0 && (
        <>
          <div className="sec">
            <h3>{t('section_letters')}</h3>
          </div>
          {recentLetters.map((l) => (
            <div className="letter" key={l.id} onClick={() => navigate('/result', { state: { result: l.analysis } })}>
              <div className={`ic ${l.analysis.action_required ? 'todo' : 'done'}`}>
                {l.analysis.action_required ? <PenLine size={19} strokeWidth={2.25} /> : <CheckCircle2 size={19} strokeWidth={2.25} />}
              </div>
              <div className="tx">
                <h4>{isolateBidiRuns(l.analysis.summary)}</h4>
                <p>{isolateBidiRuns(childFor(l.childId)?.name ?? t('assign_all_children'))}</p>
              </div>
              <span className={`tag ${l.analysis.action_required ? 'a' : 'g'}`}>
                {l.analysis.action_required ? t('tag_reply_needed') : t('tag_done')}
              </span>
            </div>
          ))}
        </>
      )}

      <div className="sec">
        <h3>{t('section_quick')}</h3>
      </div>
      <div className="quick">
        <div className="qa" onClick={() => navigate('/reply')}>
          <div className="e">
            <PenLine size={24} strokeWidth={2} />
          </div>
          <h4>{t('quick_reply_title')}</h4>
          <p>{t('quick_reply_subtitle')}</p>
        </div>
        <div className="qa" onClick={() => navigate('/guide')}>
          <div className="e">
            <BookOpen size={24} strokeWidth={2} />
          </div>
          <h4>{t('quick_guide_title')}</h4>
          <p>{t('quick_guide_subtitle')}</p>
        </div>
      </div>
    </TabLayout>
  );
}
