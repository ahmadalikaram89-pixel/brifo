import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PenLine, CheckCircle2, Wallet, CalendarClock, Mail } from 'lucide-react';
import { FlowLayout } from '../components/FlowLayout';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { isolateBidiRuns } from '../lib/bidiText';
import './ChildProfile.css';

export function ChildProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { children, lettersForChild, paymentsForChild, eventsForChild, deleteChild, markPaymentPaid } = useData();
  const [deleted, setDeleted] = useState(false);

  const child = children.find((c) => c.id === id);

  if (deleted) {
    return (
      <FlowLayout title="">
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <p>{t('child_delete_confirm')}</p>
        </div>
      </FlowLayout>
    );
  }

  if (!child || !id) {
    return (
      <FlowLayout title="">
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
          404
        </div>
      </FlowLayout>
    );
  }

  const letters = lettersForChild(id).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const payments = paymentsForChild(id).slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const unpaidPayments = payments.filter((p) => !p.paid);
  const paidPayments = payments.filter((p) => p.paid);
  const today = new Date().toISOString().slice(0, 10);
  const deadlines = eventsForChild(id)
    .filter((e) => e.source !== 'payment' && e.date >= today)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  function handleDelete() {
    if (!id) return;
    deleteChild(id);
    setDeleted(true);
    setTimeout(() => navigate('/', { replace: true }), 1200);
  }

  return (
    <FlowLayout title={child.name}>
      <div className="child-header card">
        <div className="child-avatar" style={{ background: child.color }}>
          {child.name.slice(0, 1)}
        </div>
        <div>
          <h2>{isolateBidiRuns(child.name)}</h2>
          <p>{isolateBidiRuns([child.schoolClass, child.school].filter(Boolean).join(' · '))}</p>
        </div>
      </div>

      <div className="sec">
        <h3>{t('child_profile_payments')}</h3>
      </div>
      {unpaidPayments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Wallet size={24} strokeWidth={2} />
          </div>
          <p>{t('child_no_payments')}</p>
        </div>
      ) : (
        <div className="payments-list">
          {unpaidPayments.map((p) => (
            <div className="card payment-row" key={p.id}>
              <div className="payment-info">
                <h4>{isolateBidiRuns(p.reason)}</h4>
                <p>
                  {t('payment_due_label')}: <span className="nums">{p.dueDate}</span>
                </p>
              </div>
              <div className="payment-side">
                <span className="payment-amount nums">
                  {p.amount} {p.currency}
                </span>
                <button className="scan-btn" onClick={() => markPaymentPaid(p.id, true)}>
                  {t('payment_mark_paid')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {paidPayments.length > 0 && (
        <div className="paid-list">
          {paidPayments.map((p) => (
            <div className="paid-row" key={p.id}>
              <span>{isolateBidiRuns(p.reason)}</span>
              <span className="paid-tag">{t('payment_paid_label')} ✓</span>
            </div>
          ))}
        </div>
      )}

      <div className="sec">
        <h3>{t('child_profile_deadlines')}</h3>
      </div>
      {deadlines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CalendarClock size={24} strokeWidth={2} />
          </div>
          <p>{t('child_no_deadlines')}</p>
        </div>
      ) : (
        <div className="deadlines">
          {deadlines.map((d) => (
            <div className="dl soon" key={d.id}>
              <span className="when nums">{d.date}</span>
              <h4>{isolateBidiRuns(d.title)}</h4>
            </div>
          ))}
        </div>
      )}

      <div className="sec">
        <h3>{t('child_profile_letters')}</h3>
      </div>
      {letters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Mail size={24} strokeWidth={2} />
          </div>
          <p>{t('child_no_letters')}</p>
        </div>
      ) : (
        letters.map((l) => (
          <div className="letter" key={l.id} onClick={() => navigate('/result', { state: { result: l.analysis } })}>
            <div className={`ic ${l.analysis.action_required ? 'todo' : 'done'}`}>
              {l.analysis.action_required ? <PenLine size={19} strokeWidth={2.25} /> : <CheckCircle2 size={19} strokeWidth={2.25} />}
            </div>
            <div className="tx">
              <h4>{isolateBidiRuns(l.analysis.summary)}</h4>
              <p className="nums">{l.createdAt.slice(0, 10)}</p>
            </div>
          </div>
        ))
      )}

      <button className="scan-btn delete-btn" onClick={handleDelete}>
        🗑️ {t('child_delete')}
      </button>
    </FlowLayout>
  );
}
