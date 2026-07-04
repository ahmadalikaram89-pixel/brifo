import { useNavigate } from 'react-router-dom';
import { FlowLayout } from '../components/FlowLayout';
import { ChildForm, type ChildFormValues } from '../components/ChildForm';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export function ChildNew() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addChild } = useData();

  function handleSave(values: ChildFormValues) {
    const child = addChild(values);
    navigate(`/child/${child.id}`, { replace: true });
  }

  return (
    <FlowLayout title={t('child_new_title')}>
      <ChildForm onSave={handleSave} />
    </FlowLayout>
  );
}
