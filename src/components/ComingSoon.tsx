import { useLanguage } from '../context/LanguageContext';

export function ComingSoon() {
  const { t } = useLanguage();
  return (
    <div className="card" style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)' }}>
      {t('coming_soon')}
    </div>
  );
}
