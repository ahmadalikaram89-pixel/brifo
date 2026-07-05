import { useLocation, useNavigate } from 'react-router-dom';
import { FlowLayout } from '../components/FlowLayout';
import { AddToCalendarButton } from '../components/AddToCalendarButton';
import { useLanguage } from '../context/LanguageContext';
import { isolateBidiRuns } from '../lib/bidiText';
import type { LetterAnalysis } from '../types/analysis';
import './Result.css';

export function Result() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const location = useLocation();
  const result = (location.state as { result?: LetterAnalysis } | null)?.result;

  return (
    <FlowLayout title={t('screen_result')}>
      {!result ? (
        <div className="card result-empty">
          <p>{t('result_no_data')}</p>
          <button className="scan-btn primary" onClick={() => navigate('/scan')}>
            {t('result_scan_another')}
          </button>
        </div>
      ) : (
        <div className="result-view">
          <div className={`card summary-card urgency-${result.urgency}`}>
            <span className="urgency-badge">{t(`urgency_${result.urgency}`)}</span>
            <p className="summary-text">{isolateBidiRuns(result.summary)}</p>
            <p className="action-flag">
              {result.action_required ? `⚠️ ${t('result_action_required')}` : `✅ ${t('result_no_action')}`}
            </p>
          </div>

          {result.actions.length > 0 && (
            <>
              <div className="sec">
                <h3>{t('result_actions_title')}</h3>
              </div>
              <div className="card actions-card">
                {result.actions.map((action, i) => (
                  <label className="action-item" key={i}>
                    <input type="checkbox" />
                    <span>{isolateBidiRuns(action)}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {result.deadlines.length > 0 && (
            <>
              <div className="sec">
                <h3>{t('result_deadlines_title')}</h3>
              </div>
              <div className="deadlines">
                {result.deadlines.map((d, i) => (
                  <div className="dl soon" key={i}>
                    <span className="when nums">{d.date}</span>
                    <h4>{isolateBidiRuns(d.what)}</h4>
                    <AddToCalendarButton title={d.what} date={d.date} />
                  </div>
                ))}
              </div>
            </>
          )}

          <button className="scan-btn primary result-cta" onClick={() => navigate('/scan')}>
            {t('result_scan_another')}
          </button>
        </div>
      )}
    </FlowLayout>
  );
}
