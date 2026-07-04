import { useParams } from 'react-router-dom';
import { FlowLayout } from '../components/FlowLayout';
import { useLanguage } from '../context/LanguageContext';
import { getGuideArticles } from '../data/guideArticles';
import { isolateBidiRuns } from '../lib/bidiText';
import './GuideArticle.css';

export function GuideArticle() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const article = getGuideArticles(lang).find((a) => a.id === id);

  if (!article) {
    return (
      <FlowLayout title="">
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
          404
        </div>
      </FlowLayout>
    );
  }

  return (
    <FlowLayout title={article.title}>
      <div className="card article-card">
        <div className="article-icon">{article.icon}</div>
        {article.paragraphs.map((p, i) => (
          <p className="article-paragraph" key={i}>
            {isolateBidiRuns(p)}
          </p>
        ))}
      </div>
    </FlowLayout>
  );
}
