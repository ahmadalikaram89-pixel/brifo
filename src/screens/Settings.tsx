import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { TabLayout } from '../components/TabLayout';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { isolateBidiRuns } from '../lib/bidiText';

function toggleBtnStyle(active: boolean): CSSProperties {
  return {
    flex: 1,
    padding: '10px',
    borderRadius: 14,
    border: '1px solid var(--card-border)',
    background: active ? 'linear-gradient(135deg,var(--blue),var(--purple))' : 'transparent',
    color: active ? '#fff' : 'var(--text)',
    fontWeight: 700,
    cursor: 'pointer',
  };
}

export function Settings() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { children } = useData();

  return (
    <TabLayout>
      <Header />
      <div className="sec">
        <h3>{t('screen_settings')}</h3>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{t('settings_language')}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setLang('ar')} style={toggleBtnStyle(lang === 'ar')}>
            العربية
          </button>
          <button onClick={() => setLang('de')} style={toggleBtnStyle(lang === 'de')}>
            Deutsch
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px', marginTop: 12 }}>
        <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{t('settings_theme')}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setTheme('light')} style={toggleBtnStyle(theme === 'light')}>
            {t('theme_light')}
          </button>
          <button onClick={() => setTheme('dark')} style={toggleBtnStyle(theme === 'dark')}>
            {t('theme_dark')}
          </button>
        </div>
      </div>

      <div className="sec">
        <h3>{t('section_family')}</h3>
      </div>
      <div className="card" style={{ padding: 8 }}>
        {children.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate(`/child/${c.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 8px',
              cursor: 'pointer',
              borderBottom: '1px solid var(--card-border)',
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: c.color,
                color: '#fff',
                fontWeight: 800,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {c.name.slice(0, 1)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isolateBidiRuns(c.name)}
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {c.type === 'adult' ? t('member_type_adult') : t('member_type_child')}
              </p>
            </div>
          </div>
        ))}
        <div
          onClick={() => navigate('/child/new')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', cursor: 'pointer', color: 'var(--blue)' }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px dashed var(--card-border)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
          </span>
          <p style={{ fontSize: 15, fontWeight: 700 }}>{t('home_add_child')}</p>
        </div>
      </div>
    </TabLayout>
  );
}
