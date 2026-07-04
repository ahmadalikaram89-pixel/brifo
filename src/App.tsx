import { Routes, Route } from 'react-router-dom';
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

function App() {
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
    </Routes>
  );
}

export default App;
