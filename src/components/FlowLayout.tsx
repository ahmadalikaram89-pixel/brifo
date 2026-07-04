import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './FlowLayout.css';

export function FlowLayout({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="app">
      <div className="flow-header">
        <button className="flow-back" onClick={() => navigate(-1)} aria-label={t('back')}>
          ‹
        </button>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
