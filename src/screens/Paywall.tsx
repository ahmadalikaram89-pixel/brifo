import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowLayout } from '../components/FlowLayout';
import { useLanguage } from '../context/LanguageContext';

export function Paywall() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [consented, setConsented] = useState(false);
  const [showNotReady, setShowNotReady] = useState(false);

  return (
    <FlowLayout title={t('screen_paywall')}>
      <div className="card" style={{ padding: '20px', margin: '16px' }}>
        <p style={{ fontSize: 17, fontWeight: 900 }}>{t('paywall_plan_name')}</p>
        <p style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>
          {t('paywall_price')} <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>{t('paywall_price_period')}</span>
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12 }}>{t('paywall_features_note')}</p>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--card-border)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => {
              setConsented(e.target.checked);
              setShowNotReady(false);
            }}
            style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: 'var(--blue)' }}
          />
          <span>
            {t('paywall_consent_label')}{' '}
            <span
              onClick={(e) => {
                e.preventDefault();
                navigate('/agb');
              }}
              style={{ color: 'var(--blue)', textDecoration: 'underline' }}
            >
              {t('paywall_consent_link')}
            </span>
          </span>
        </label>

        <button
          className="scan-btn primary"
          style={{ width: '100%', marginTop: 16 }}
          disabled={!consented}
          onClick={() => setShowNotReady(true)}
        >
          {t('paywall_subscribe_button')}
        </button>
        {showNotReady && (
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10 }}>{t('paywall_not_ready_note')}</p>
        )}
      </div>
    </FlowLayout>
  );
}
