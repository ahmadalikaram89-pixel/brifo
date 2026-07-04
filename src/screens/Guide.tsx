import { useNavigate } from 'react-router-dom';
import { TabLayout } from '../components/TabLayout';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { getGuideArticles } from '../data/guideArticles';
import { isolateBidiRuns } from '../lib/bidiText';
import './Guide.css';

export function Guide() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const articles = getGuideArticles(lang);

  return (
    <TabLayout>
      <Header />
      <div className="sec">
        <h3>{t('screen_guide')}</h3>
      </div>
      <div className="guide-list">
        {articles.map((article) => (
          <div className="guide-card" key={article.id} onClick={() => navigate(`/guide/${article.id}`)}>
            <div className="guide-icon">{article.icon}</div>
            <div className="guide-text">
              <h4>{isolateBidiRuns(article.title)}</h4>
              <p>{isolateBidiRuns(article.teaser)}</p>
            </div>
            <span className="guide-arrow">›</span>
          </div>
        ))}
      </div>
    </TabLayout>
  );
}
