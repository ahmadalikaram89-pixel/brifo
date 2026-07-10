import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { TabLayout } from '../components/TabLayout';
import { Header } from '../components/Header';
import { RatingStars } from '../components/RatingStars';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { isolateBidiRuns } from '../lib/bidiText';
import { downloadBackup, parseBackupFile, BackupParseError, type RestorableState } from '../lib/backup';
import type { TranslationKey } from '../context/translations';
import {
  enableReminders,
  disableReminders,
  notificationsSupported,
  remindersEnabled,
  getReminderOffsets,
  setReminderOffsets,
  REMINDER_OFFSET_DAY_BEFORE,
  REMINDER_OFFSET_HOUR_BEFORE,
  REMINDER_OFFSET_15MIN_BEFORE,
} from '../lib/reminders';
import { pushEnabled, subscribeToPush, unsubscribeFromPush, syncPushReminders, type SyncablePushEvent } from '../lib/push';

const OFFSET_OPTIONS = [
  { value: REMINDER_OFFSET_DAY_BEFORE, key: 'reminders_offset_day' as const },
  { value: REMINDER_OFFSET_HOUR_BEFORE, key: 'reminders_offset_hour' as const },
  { value: REMINDER_OFFSET_15MIN_BEFORE, key: 'reminders_offset_15min' as const },
];

function toggleBtnStyle(active: boolean): CSSProperties {
  return {
    flex: 1,
    padding: '10px',
    borderRadius: 14,
    border: '1px solid var(--card-border)',
    background: active ? 'linear-gradient(135deg,var(--blue),var(--purple))' : 'transparent',
    color: active ? '#fff' : 'var(--text)',
    fontWeight: 700,
    cursor: 'pointer',
  };
}

export function Settings() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { children, letters, payments, events, todos, rating, submitRating, restoreBackup } = useData();

  const [remindersOn, setRemindersOn] = useState(remindersEnabled());
  const [remindersDenied, setRemindersDenied] = useState(false);
  const [pushActive, setPushActive] = useState(pushEnabled());
  const [offsets, setOffsets] = useState(getReminderOffsets());
  const [stars, setStars] = useState(rating?.stars ?? 0);
  const [comment, setComment] = useState(rating?.comment ?? '');
  const [ratingSaved, setRatingSaved] = useState(false);

  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingRestore, setPendingRestore] = useState<RestorableState | null>(null);
  const [restoreError, setRestoreError] = useState<TranslationKey | null>(null);
  const [restoreDone, setRestoreDone] = useState(false);

  // Restoring a backup replaces `rating` out from under this component's own
  // once-initialized star/comment state — resync whenever it changes.
  useEffect(() => {
    setStars(rating?.stars ?? 0);
    setComment(rating?.comment ?? '');
  }, [rating]);

  function upcomingSyncEvents(): SyncablePushEvent[] {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter((e) => e.date >= today).map((e) => ({ id: e.id, title: e.title, date: e.date }));
  }

  async function handleToggleReminders() {
    if (remindersOn) {
      disableReminders();
      await unsubscribeFromPush();
      setRemindersOn(false);
      setPushActive(false);
      return;
    }
    const granted = await enableReminders();
    setRemindersOn(granted);
    setRemindersDenied(!granted);
    if (!granted) return;

    const subscribed = await subscribeToPush();
    setPushActive(subscribed);
    if (subscribed) await syncPushReminders(upcomingSyncEvents(), offsets, lang);
  }

  function handleToggleOffset(value: number) {
    const next = offsets.includes(value) ? offsets.filter((o) => o !== value) : [...offsets, value].sort((a, b) => b - a);
    setOffsets(next);
    setReminderOffsets(next);
    if (pushActive) syncPushReminders(upcomingSyncEvents(), next, lang);
  }

  function handleRate(next: number) {
    setStars(next);
    submitRating(next, comment);
    setRatingSaved(true);
  }

  function handleCommentBlur() {
    if (stars === 0) return;
    submitRating(stars, comment);
    setRatingSaved(true);
  }

  function handleExportBackup() {
    downloadBackup({ children, letters, payments, events, todos, rating });
  }

  async function handleBackupFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setRestoreError(null);
    setRestoreDone(false);
    try {
      setPendingRestore(await parseBackupFile(file));
    } catch (err) {
      setRestoreError(err instanceof BackupParseError ? (err.message as TranslationKey) : 'backup_error_read');
    }
  }

  function handleConfirmRestore() {
    if (!pendingRestore) return;
    restoreBackup(pendingRestore);
    setPendingRestore(null);
    setRestoreDone(true);
  }

  return (
    <TabLayout>
      <Header />
      <div className="sec">
        <h3>{t('screen_settings')}</h3>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{t('settings_language')}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setLang('ar')} style={toggleBtnStyle(lang === 'ar')}>
            العربية
          </button>
          <button onClick={() => setLang('de')} style={toggleBtnStyle(lang === 'de')}>
            Deutsch
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px', marginTop: 12 }}>
        <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{t('settings_theme')}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setTheme('light')} style={toggleBtnStyle(theme === 'light')}>
            {t('theme_light')}
          </button>
          <button onClick={() => setTheme('dark')} style={toggleBtnStyle(theme === 'dark')}>
            {t('theme_dark')}
          </button>
        </div>
      </div>

      <div className="sec">
        <h3>{t('reminders_title')}</h3>
      </div>
      <div className="card" style={{ padding: '16px' }}>
        <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{t('reminders_toggle_label')}</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>{t('reminders_toggle_subtitle')}</p>
        {notificationsSupported() ? (
          <>
            <button onClick={handleToggleReminders} style={{ ...toggleBtnStyle(remindersOn), width: '100%' }}>
              {remindersOn ? t('reminders_on') : t('reminders_off')}
            </button>
            {remindersDenied && <p style={{ fontSize: 12.5, color: 'var(--red)', marginTop: 8 }}>{t('reminders_permission_denied')}</p>}
            {remindersOn && (
              <p style={{ fontSize: 12.5, color: pushActive ? 'var(--green)' : 'var(--amber)', fontWeight: 700, marginTop: 8 }}>
                {pushActive ? t('reminders_push_active') : t('reminders_push_fallback')}
              </p>
            )}
            {remindersOn && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--card-border)' }}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t('reminders_offsets_label')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {OFFSET_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={offsets.includes(opt.value)}
                        onChange={() => handleToggleOffset(opt.value)}
                        style={{ width: 18, height: 18, accentColor: 'var(--blue)' }}
                      />
                      {t(opt.key)}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{t('reminders_unsupported')}</p>
        )}
      </div>

      <div className="sec">
        <h3>{t('rate_title')}</h3>
      </div>
      <div className="card" style={{ padding: '16px' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>{t('rate_subtitle')}</p>
        <RatingStars value={stars} onChange={handleRate} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={handleCommentBlur}
          placeholder={t('rate_comment_placeholder')}
          rows={3}
          style={{
            width: '100%',
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 14,
            border: '1px solid var(--card-border)',
            background: 'var(--card)',
            color: 'var(--text)',
            fontFamily: 'inherit',
            fontSize: 14,
            resize: 'vertical',
          }}
        />
        {ratingSaved && stars > 0 && (
          <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 700, marginTop: 8 }}>{t('rate_thanks')}</p>
        )}
      </div>

      <div className="sec">
        <h3>{t('backup_title')}</h3>
      </div>
      <div className="card" style={{ padding: '16px' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>{t('backup_subtitle')}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="scan-btn" style={{ flex: 1 }} onClick={handleExportBackup}>
            {t('backup_export')}
          </button>
          <button className="scan-btn" style={{ flex: 1 }} onClick={() => backupFileInputRef.current?.click()}>
            {t('backup_import')}
          </button>
        </div>
        <input
          ref={backupFileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleBackupFileSelected}
        />
        {restoreError && <p style={{ fontSize: 12.5, color: 'var(--red)', marginTop: 8 }}>{t(restoreError)}</p>}
        {restoreDone && <p style={{ fontSize: 12.5, color: 'var(--green)', fontWeight: 700, marginTop: 8 }}>{t('backup_restore_done')}</p>}
        {pendingRestore && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--card-border)' }}>
            <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{t('backup_confirm_title')}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
              {t('backup_confirm_summary')
                .replace('{children}', String(pendingRestore.children.length))
                .replace('{events}', String(pendingRestore.events.length))}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="scan-btn" style={{ flex: 1 }} onClick={() => setPendingRestore(null)}>
                {t('cancel')}
              </button>
              <button className="scan-btn primary" style={{ flex: 1 }} onClick={handleConfirmRestore}>
                {t('backup_confirm_restore')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="sec">
        <h3>{t('section_family')}</h3>
      </div>
      <div className="card" style={{ padding: 8 }}>
        {children.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate(`/child/${c.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 8px',
              cursor: 'pointer',
              borderBottom: '1px solid var(--card-border)',
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: c.color,
                color: '#fff',
                fontWeight: 800,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {c.name.slice(0, 1)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isolateBidiRuns(c.name)}
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {c.type === 'adult' ? t('member_type_adult') : t('member_type_child')}
              </p>
            </div>
          </div>
        ))}
        <div
          onClick={() => navigate('/child/new')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', cursor: 'pointer', color: 'var(--blue)' }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px dashed var(--card-border)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
          </span>
          <p style={{ fontSize: 15, fontWeight: 700 }}>{t('home_add_child')}</p>
        </div>
      </div>
    </TabLayout>
  );
}
