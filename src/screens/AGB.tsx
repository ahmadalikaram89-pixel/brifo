import { FlowLayout } from '../components/FlowLayout';
import { useLanguage } from '../context/LanguageContext';
import { agbAr, agbDe, AGB_LAST_UPDATED } from '../data/agb';
import './Datenschutz.css';

export function AGB() {
  const { t, lang } = useLanguage();
  const sections = lang === 'de' ? agbDe : agbAr;

  return (
    <FlowLayout title={t('agb_title')}>
      <div className="privacy-updated">
        {t('privacy_last_updated')} <span className="nums">{AGB_LAST_UPDATED}</span>
      </div>
      {sections.map((section) => (
        <div className="card privacy-section" key={section.heading}>
          <h3>{section.heading}</h3>
          {section.body.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ))}
    </FlowLayout>
  );
}
