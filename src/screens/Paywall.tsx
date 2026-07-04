import { FlowLayout } from '../components/FlowLayout';
import { ComingSoon } from '../components/ComingSoon';
import { useLanguage } from '../context/LanguageContext';

export function Paywall() {
  const { t } = useLanguage();
  return (
    <FlowLayout title={t('screen_paywall')}>
      <ComingSoon />
    </FlowLayout>
  );
}
