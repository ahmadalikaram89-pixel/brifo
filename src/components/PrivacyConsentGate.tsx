import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { acceptPrivacyPolicy } from '../lib/consent';

interface PrivacyConsentGateProps {
  onAccept: () => void;
}

export function PrivacyConsentGate({ onAccept }: PrivacyConsentGateProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  function handleAccept() {
    acceptPrivacyPolicy();
    onAccept();
  }

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
        gap: 16,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'linear-gradient(135deg,var(--blue),var(--purple))',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          boxShadow: '0 14px 34px rgba(109,92,231,.4)',
        }}
      >
        <ShieldCheck size={32} strokeWidth={2} />
      </div>
      <h1 style={{ fontSize: 21, fontWeight: 900 }}>{t('privacy_gate_title')}</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 320 }}>{t('privacy_gate_summary')}</p>

      <button
        onClick={() => navigate('/datenschutz')}
        style={{
          marginTop: 8,
          padding: '12px 20px',
          borderRadius: 14,
          border: '1px solid var(--card-border)',
          background: 'var(--card)',
          color: 'var(--text)',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        {t('privacy_gate_read_full')}
      </button>
      <button
        onClick={handleAccept}
        style={{
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
        {t('privacy_gate_accept')}
      </button>
    </div>
  );
}
