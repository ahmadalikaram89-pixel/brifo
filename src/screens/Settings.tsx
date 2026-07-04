import { TabLayout } from '../components/TabLayout';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';

export function Settings() {
  const { t, lang, setLang } = useLanguage();

  return (
    <TabLayout>
      <Header />
      <div className="sec">
        <h3>{t('screen_settings')}</h3>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{t('settings_language')}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setLang('ar')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 14,
              border: '1px solid var(--card-border)',
              background: lang === 'ar' ? 'linear-gradient(135deg,var(--blue),var(--purple))' : 'transparent',
              color: 'var(--text)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            العربية
          </button>
          <button
            onClick={() => setLang('de')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 14,
              border: '1px solid var(--card-border)',
              background: lang === 'de' ? 'linear-gradient(135deg,var(--blue),var(--purple))' : 'transparent',
              color: 'var(--text)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Deutsch
          </button>
        </div>
      </div>
    </TabLayout>
  );
}
