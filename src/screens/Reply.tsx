import { useState } from 'react';
import { FlowLayout } from '../components/FlowLayout';
import { useLanguage } from '../context/LanguageContext';
import { isolateBidiRuns } from '../lib/bidiText';
import type { ReplyIntent, ReplyLetter } from '../types/reply';
import './Reply.css';

type ScreenState = 'form' | 'generating' | 'result' | 'error';

const INTENTS: ReplyIntent[] = ['entschuldigung', 'termin', 'zustimmung', 'frage'];
const INTENT_ICON: Record<ReplyIntent, string> = {
  entschuldigung: '🤒',
  termin: '📅',
  zustimmung: '✅',
  frage: '❓',
};

export function Reply() {
  const { t } = useLanguage();

  const [state, setState] = useState<ScreenState>('form');
  const [intent, setIntent] = useState<ReplyIntent | null>(null);
  const [childName, setChildName] = useState('');
  const [childClass, setChildClass] = useState('');
  const [details, setDetails] = useState('');
  const [letter, setLetter] = useState<ReplyLetter | null>(null);
  const [copied, setCopied] = useState<'german' | 'arabic' | null>(null);

  const canGenerate = intent !== null && details.trim().length >= 3;

  async function generate() {
    if (!canGenerate) return;
    setState('generating');
    try {
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          childName: childName.trim() || undefined,
          childClass: childClass.trim() || undefined,
          details: details.trim(),
        }),
      });
      if (!response.ok) throw new Error('request failed');
      const result: ReplyLetter = await response.json();
      setLetter(result);
      setState('result');
    } catch {
      setState('error');
    }
  }

  function startOver() {
    setLetter(null);
    setState('form');
  }

  async function copy(text: string, which: 'german' | 'arabic') {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard permission denied — nothing to recover, button stays as-is
    }
  }

  function shareWhatsApp(text: string) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <FlowLayout title={t('screen_reply')}>
      {state === 'form' && (
        <div className="reply-form">
          <div className="sec">
            <h3>{t('reply_intent_title')}</h3>
          </div>
          <div className="intent-grid">
            {INTENTS.map((i) => (
              <button
                key={i}
                className={`intent-chip${intent === i ? ' selected' : ''}`}
                onClick={() => setIntent(i)}
              >
                <span className="intent-icon">{INTENT_ICON[i]}</span>
                {t(`reply_intent_${i}`)}
              </button>
            ))}
          </div>

          <div className="field">
            <label>{t('reply_child_name')}</label>
            <input value={childName} onChange={(e) => setChildName(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('reply_child_class')}</label>
            <input value={childClass} onChange={(e) => setChildClass(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('reply_details_label')}</label>
            <textarea
              rows={5}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('reply_details_placeholder')}
            />
          </div>

          <button className="scan-btn primary reply-generate-btn" disabled={!canGenerate} onClick={generate}>
            ✍️ {t('reply_generate')}
          </button>
        </div>
      )}

      {state === 'generating' && (
        <div className="card analyzing-card">
          <div className="spinner" />
          <p>{t('reply_generating')}</p>
        </div>
      )}

      {state === 'error' && (
        <div className="card error-card">
          <p>{t('reply_error')}</p>
          <button className="scan-btn primary" onClick={startOver}>
            {t('scan_try_again')}
          </button>
        </div>
      )}

      {state === 'result' && letter && (
        <div className="reply-result">
          <div className="sec">
            <h3>{t('reply_german_label')}</h3>
          </div>
          <div className="card letter-card" dir="ltr">
            <p className="letter-text">{isolateBidiRuns(letter.german)}</p>
            <div className="letter-actions">
              <button className="scan-btn" onClick={() => copy(letter.german, 'german')}>
                {copied === 'german' ? t('reply_copied') : t('reply_copy')}
              </button>
              <button className="scan-btn primary" onClick={() => shareWhatsApp(letter.german)}>
                📤 {t('reply_share_whatsapp')}
              </button>
            </div>
          </div>

          <div className="sec">
            <h3>{t('reply_arabic_label')}</h3>
          </div>
          <div className="card letter-card" dir="rtl">
            <p className="letter-text">{isolateBidiRuns(letter.arabic)}</p>
            <div className="letter-actions">
              <button className="scan-btn" onClick={() => copy(letter.arabic, 'arabic')}>
                {copied === 'arabic' ? t('reply_copied') : t('reply_copy')}
              </button>
            </div>
          </div>

          <button className="scan-btn reply-generate-btn" onClick={startOver}>
            {t('reply_new')}
          </button>
        </div>
      )}
    </FlowLayout>
  );
}
