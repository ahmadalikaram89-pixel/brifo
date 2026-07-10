import { useState } from 'react';
import { ListChecks, Trash2 } from 'lucide-react';
import { TabLayout } from '../components/TabLayout';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ALL_CHILDREN } from '../types/data';
import { isolateBidiRuns } from '../lib/bidiText';
import { colorsForChildId, dotBackground } from '../lib/childColors';
import './Todo.css';

export function Todo() {
  const { t } = useLanguage();
  const { children, todos, addTodo, toggleTodo, deleteTodo } = useData();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [childId, setChildId] = useState<string>(ALL_CHILDREN);

  const pending = todos
    .filter((item) => !item.done)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const done = todos
    .filter((item) => item.done)
    .slice()
    .sort((a, b) => (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt));

  function childFor(id: string) {
    return children.find((c) => c.id === id);
  }

  function submit() {
    if (!title.trim()) return;
    addTodo(childId, title.trim());
    setTitle('');
    setChildId(ALL_CHILDREN);
    setShowForm(false);
  }

  return (
    <TabLayout>
      <Header />
      <div className="sec">
        <h3>{t('screen_todo')}</h3>
        <a onClick={() => setShowForm((v) => !v)}>{t('todo_add')}</a>
      </div>

      {showForm && (
        <div className="card event-form">
          <div className="field">
            <label>{t('todo_title_label')}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('todo_title_placeholder')} />
          </div>
          <div className="field">
            <label>{t('calendar_event_child_label')}</label>
            <select value={childId} onChange={(e) => setChildId(e.target.value)}>
              <option value={ALL_CHILDREN}>{t('assign_all_children')}</option>
              {children.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.schoolClass ? `${c.name} (${c.schoolClass})` : c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="event-form-actions">
            <button className="scan-btn" onClick={() => setShowForm(false)}>
              {t('cancel')}
            </button>
            <button className="scan-btn primary" onClick={submit}>
              {t('save')}
            </button>
          </div>
        </div>
      )}

      {pending.length === 0 && done.length === 0 ? (
        <div className="empty-state actionable" onClick={() => setShowForm(true)}>
          <div className="empty-state-icon">
            <ListChecks size={26} strokeWidth={2} />
          </div>
          <p>{t('todo_empty')}</p>
        </div>
      ) : (
        <>
          <div className="sec">
            <h3>{t('todo_section_new')}</h3>
          </div>
          {pending.length === 0 ? (
            <p className="todo-section-empty">{t('todo_section_new_empty')}</p>
          ) : (
            <div className="todo-list">
              {pending.map((item) => (
                <div className="card todo-row" key={item.id}>
                  <button className="todo-check" onClick={() => toggleTodo(item.id)} aria-label={t('todo_mark_done')} />
                  <div className="todo-info">
                    <h4>{isolateBidiRuns(item.title)}</h4>
                    <p>
                      <span className="todo-dot" style={{ background: dotBackground(colorsForChildId(item.childId, children)) }} />
                      {isolateBidiRuns(childFor(item.childId)?.name ?? t('assign_all_children'))}
                    </p>
                  </div>
                  <button className="todo-delete" onClick={() => deleteTodo(item.id)} aria-label={t('todo_delete')}>
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="sec">
            <h3>{t('todo_section_done')}</h3>
          </div>
          {done.length === 0 ? (
            <p className="todo-section-empty">{t('todo_section_done_empty')}</p>
          ) : (
            <div className="todo-list">
              {done.map((item) => (
                <div className="todo-row-done" key={item.id}>
                  <button className="todo-check on" onClick={() => toggleTodo(item.id)} aria-label={t('todo_mark_undone')} />
                  <span className="todo-done-title">{isolateBidiRuns(item.title)}</span>
                  <button className="todo-delete" onClick={() => deleteTodo(item.id)} aria-label={t('todo_delete')}>
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </TabLayout>
  );
}
