import { Bell, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Header.css';

export function Header() {
  const { t } = useLanguage();
  return (
    <header className="brifo-header">
      <div className="brand">
        <div className="logo">
          <Mail size={20} strokeWidth={2.25} color="#fff" />
        </div>
        <div className="brand-name" dir="ltr">
          Bri<span>fo</span>
        </div>
      </div>
      <button className="bell" aria-label={t('notifications_label')}>
        <Bell size={20} strokeWidth={2.25} />
        <i />
      </button>
    </header>
  );
}
