import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './ChildForm.css';

export interface ChildFormValues {
  name: string;
  schoolClass: string;
  school?: string;
  consentGiven: boolean;
}

interface ChildFormProps {
  initialName?: string;
  initialClass?: string;
  onSave: (values: ChildFormValues) => void;
  saveLabel?: string;
}

export function ChildForm({ initialName = '', initialClass = '', onSave, saveLabel }: ChildFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(initialName);
  const [schoolClass, setSchoolClass] = useState(initialClass);
  const [school, setSchool] = useState('');
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);

  const nameValid = name.trim().length > 0;
  const canSave = nameValid && consent;

  function submit() {
    setTouched(true);
    if (!canSave) return;
    onSave({ name: name.trim(), schoolClass: schoolClass.trim(), school: school.trim() || undefined, consentGiven: true });
  }

  return (
    <div className="child-form">
      <div className="field">
        <label>{t('child_name_label')}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        {touched && !nameValid && <p className="field-error">{t('child_name_required')}</p>}
      </div>
      <div className="field">
        <label>{t('child_class_label')}</label>
        <input value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} placeholder="3B" />
      </div>
      <div className="field">
        <label>{t('child_school_label')}</label>
        <input value={school} onChange={(e) => setSchool(e.target.value)} />
      </div>

      <label className="consent-row">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{t('child_consent_label')}</span>
      </label>
      {touched && !consent && <p className="field-error">{t('child_consent_required')}</p>}

      <button className="scan-btn primary child-save-btn" onClick={submit}>
        {saveLabel ?? t('save')}
      </button>
    </div>
  );
}
