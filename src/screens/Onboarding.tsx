import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export function Onboarding() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  return (
    <div
      className="app"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 20,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 24,
          background: 'linear-gradient(135deg,var(--blue),var(--purple))',
          display: 'grid',
          placeItems: 'center',
          fontSize: 40,
          boxShadow: '0 14px 34px rgba(109,92,231,.45)',
        }}
      >
        📬
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>{t('screen_onboarding')}</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 320 }}>{t('scan_subtitle')}</p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 16,
          padding: '14px 32px',
          borderRadius: 16,
          border: 'none',
          background: 'linear-gradient(135deg,var(--blue),var(--purple))',
          color: '#fff',
          fontWeight: 800,
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        {t('nav_home')} {lang === 'ar' ? '←' : '→'}
      </button>
    </div>
  );
}
