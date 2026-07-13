import { useState } from 'react';
import { FlowLayout } from '../components/FlowLayout';
import { useLanguage } from '../context/LanguageContext';
import { isolateBidiRuns } from '../lib/bidiText';

interface StoredRating {
  id: string;
  stars: number;
  comment: string;
  lang: 'ar' | 'de';
  createdAt: string;
}

export function Admin() {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [ratings, setRatings] = useState<StoredRating[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin/ratings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secret: password }),
      });
      if (!res.ok) {
        setError(true);
        setRatings(null);
        return;
      }
      const payload = (await res.json()) as { ratings: StoredRating[] };
      setRatings(payload.ratings);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const average = ratings && ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length : null;

  return (
    <FlowLayout title={t('screen_admin')}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
            placeholder={t('admin_password_placeholder')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 14,
              border: '1px solid var(--card-border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: 14,
            }}
          />
          <button className="scan-btn primary" onClick={handleFetch} disabled={loading}>
            {t('admin_fetch_button')}
          </button>
        </div>
        {error && <p style={{ fontSize: 12.5, color: 'var(--red)', marginTop: 8 }}>{t('admin_unauthorized')}</p>}
      </div>

      {ratings && (
        <>
          {average !== null && (
            <p style={{ fontSize: 14, fontWeight: 800, margin: '16px 2px' }}>
              {t('admin_average_label').replace('{avg}', average.toFixed(1)).replace('{count}', String(ratings.length))}
            </p>
          )}
          {ratings.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 16 }}>{t('admin_empty')}</p>}
          {ratings.map((r) => (
            <div key={r.id} className="card" style={{ padding: 14, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: 'var(--amber)', fontWeight: 800 }}>
                  {'★'.repeat(r.stars)}
                  {'☆'.repeat(5 - r.stars)}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.comment && <p style={{ fontSize: 13.5 }}>{isolateBidiRuns(r.comment)}</p>}
            </div>
          ))}
        </>
      )}
    </FlowLayout>
  );
}
