import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './screens/Home';
import { Onboarding } from './screens/Onboarding';
import { Scan } from './screens/Scan';
import { Result } from './screens/Result';
import { Reply } from './screens/Reply';
import { Calendar } from './screens/Calendar';
import { Guide } from './screens/Guide';
import { GuideArticle } from './screens/GuideArticle';
import { Paywall } from './screens/Paywall';
import { Settings } from './screens/Settings';
import { ChildNew } from './screens/ChildNew';
import { ChildProfile } from './screens/ChildProfile';
import { Todo } from './screens/Todo';
import { Datenschutz } from './screens/Datenschutz';
import { PrivacyConsentGate } from './components/PrivacyConsentGate';
import { useLanguage } from './context/LanguageContext';
import { useData } from './context/DataContext';
import { useReminderScheduler } from './lib/useReminderScheduler';
import { usePushSync } from './lib/usePushSync';
import { hasAcceptedPrivacyPolicy } from './lib/consent';

function App() {
  const { t, lang } = useLanguage();
  const { events } = useData();
  const location = useLocation();
  const [consented, setConsented] = useState(hasAcceptedPrivacyPolicy());
  useReminderScheduler(events, t('reminders_body_day_before'), t('reminders_body_hour_before'), t('reminders_body_soon'));
  usePushSync(events, lang);

  // The privacy policy itself must stay reachable even before acceptance,
  // otherwise there's no way to read it before agreeing.
  if (!consented && location.pathname !== '/datenschutz') {
    return <PrivacyConsentGate onAccept={() => setConsented(true)} />;
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<Home />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/result" element={<Result />} />
      <Route path="/reply" element={<Reply />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/guide/:id" element={<GuideArticle />} />
      <Route path="/paywall" element={<Paywall />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/child/new" element={<ChildNew />} />
      <Route path="/child/:id" element={<ChildProfile />} />
      <Route path="/todo" element={<Todo />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
    </Routes>
  );
}

export default App;
