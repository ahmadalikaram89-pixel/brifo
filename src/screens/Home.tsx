import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { TabLayout } from '../components/TabLayout';
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

  return (
    <TabLayout>
      <Header />

      <div className="greeting">
        <h1>{greeting}</h1>
        <p>{t('greeting_subtitle')}</p>
      </div>

      <div className="scan" onClick={() => navigate('/scan')}>
        <div className="cam">📸</div>
        <h2>{t('scan_title')}</h2>
        <p>{t('scan_subtitle')}</p>
      </div>

      <div className="sec">
        <h3>{t('home_children_title')}</h3>
        <a onClick={() => navigate('/child/new')}>{t('home_add_child')}</a>
      </div>
      {children.length === 0 ? (
        <div className="card empty-note">{t('home_no_children')}</div>
      ) : (
        <div className="children-grid">
          {children.map((c) => (
            <div className="child-card" key={c.id} onClick={() => navigate(`/child/${c.id}`)}>
              <div className="child-card-avatar" style={{ background: c.color }}>
                {c.name.slice(0, 1)}
              </div>
              <h4>{c.name}</h4>
              <p>{c.schoolClass}</p>
            </div>
          ))}
        </div>
      )}

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
                  <span className="when nums">{e.date}</span>
                  <h4>{isolateBidiRuns(e.title)}</h4>
                  <p>{isolateBidiRuns(child ? `${child.name} · ${child.schoolClass}` : t('assign_all_children'))}</p>
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
                {l.analysis.action_required ? '✍️' : '✅'}
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
          <div className="e">✍️</div>
          <h4>{t('quick_reply_title')}</h4>
          <p>{t('quick_reply_subtitle')}</p>
        </div>
        <div className="qa" onClick={() => navigate('/guide')}>
          <div className="e">📚</div>
          <h4>{t('quick_guide_title')}</h4>
          <p>{t('quick_guide_subtitle')}</p>
        </div>
      </div>
    </TabLayout>
  );
}
