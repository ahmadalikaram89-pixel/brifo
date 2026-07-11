import { FlowLayout } from '../components/FlowLayout';
import { useLanguage } from '../context/LanguageContext';
import { privacyPolicyAr, privacyPolicyDe, PRIVACY_POLICY_LAST_UPDATED } from '../data/privacyPolicy';
import './Datenschutz.css';

export function Datenschutz() {
  const { t, lang } = useLanguage();
  const sections = lang === 'de' ? privacyPolicyDe : privacyPolicyAr;

  return (
    <FlowLayout title={t('privacy_title')}>
      <div className="privacy-updated">
        {t('privacy_last_updated')} <span className="nums">{PRIVACY_POLICY_LAST_UPDATED}</span>
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
