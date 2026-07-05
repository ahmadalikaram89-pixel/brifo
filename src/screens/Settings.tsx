import type { CSSProperties } from 'react';
import { TabLayout } from '../components/TabLayout';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

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
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();

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
    </TabLayout>
  );
}
