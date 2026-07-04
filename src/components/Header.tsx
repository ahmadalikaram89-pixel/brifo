import { useLanguage } from '../context/LanguageContext';
import './Header.css';

export function Header() {
  const { t } = useLanguage();
  return (
    <header className="brifo-header">
      <div className="brand">
        <div className="logo">📬</div>
        <div className="brand-name">
          Bri<span>fo</span>
        </div>
      </div>
      <button className="bell" aria-label={t('notifications_label')}>
        🔔<i />
      </button>
    </header>
  );
}
