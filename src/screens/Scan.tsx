import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowLayout } from '../components/FlowLayout';
import { ChildForm, type ChildFormValues } from '../components/ChildForm';
import { useLanguage } from '../context/LanguageContext';
import { useData, findMatchingChild } from '../context/DataContext';
import { ALL_CHILDREN, type Child } from '../types/data';
import { compressImage } from '../lib/compressImage';
import { isolateBidiRuns } from '../lib/bidiText';
import type { LetterAnalysis } from '../types/analysis';
import './Scan.css';

type ScanState = 'idle' | 'camera' | 'preview' | 'analyzing' | 'assign' | 'error';
type AssignMode = 'confirm' | 'pick' | 'create' | null;

export function Scan() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { children, addChild, addLetter } = useData();

  const [state, setState] = useState<ScanState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [pendingResult, setPendingResult] = useState<LetterAnalysis | null>(null);
  const [assignMode, setAssignMode] = useState<AssignMode>(null);
  const [matchedChild, setMatchedChild] = useState<Child | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fallbackCaptureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stopStream();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // The <video> element only exists in the DOM once `state === 'camera'` (it's
  // behind a conditional render), so the stream must be attached here — after
  // React has committed and mounted it — rather than right after getUserMedia
  // resolves, or videoRef.current is still null.
  useEffect(() => {
    if (state !== 'camera') return;
    const video = videoRef.current;
    const stream = streamRef.current;
    console.log('[Scan] camera effect', { hasVideo: !!video, hasStream: !!stream });
    if (!video || !stream) return;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    console.log('[Scan] srcObject attached', stream.getVideoTracks().map((t) => t.label || t.kind));

    video
      .play()
      .then(() => console.log('[Scan] video.play() resolved'))
      .catch((err) => console.error('[Scan] video.play() failed', err));
  }, [state]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function openCamera() {
    try {
      console.log('[Scan] requesting getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      console.log(
        '[Scan] getUserMedia resolved',
        stream.getVideoTracks().map((t) => ({ label: t.label, settings: t.getSettings() })),
      );
      streamRef.current = stream;
      setState('camera');
    } catch (err) {
      console.error('[Scan] getUserMedia failed', err);
      fallbackCaptureInputRef.current?.click();
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      stopStream();
      setCapturedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setState('preview');
    }, 'image/jpeg', 0.92);
  }

  function cancelCamera() {
    stopStream();
    setState('idle');
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCapturedBlob(file);
    setPreviewUrl(URL.createObjectURL(file));
    setState('preview');
  }

  function retake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCapturedBlob(null);
    setState('idle');
  }

  async function confirmAndAnalyze() {
    if (!capturedBlob) return;
    setState('analyzing');
    try {
      const { base64, mediaType } = await compressImage(capturedBlob);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType }),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.error(`[Scan] /api/analyze failed: ${response.status} ${response.statusText}`, body);
        throw new Error('request failed');
      }
      const result: LetterAnalysis = await response.json();
      setPendingResult(result);

      if (children.length === 0) {
        setAssignMode('create');
      } else {
        const match = findMatchingChild(children, result.detected_child_name, result.detected_child_class);
        if (match) {
          setMatchedChild(match);
          setAssignMode('confirm');
        } else {
          setAssignMode('pick');
        }
      }
      setState('assign');
    } catch (err) {
      console.error('[Scan] confirmAndAnalyze failed:', err);
      setErrorMessage(t('scan_error'));
      setState('error');
    }
  }

  function finalizeAssignment(childId: string) {
    if (!pendingResult) return;
    addLetter(childId, pendingResult);
    navigate('/result', { state: { result: pendingResult } });
  }

  function handleCreateChild(values: ChildFormValues) {
    const child = addChild(values);
    finalizeAssignment(child.id);
  }

  return (
    <FlowLayout title={t('screen_scan')}>
      <input ref={galleryInputRef} type="file" accept="image/*" hidden onChange={onFileSelected} />
      <input
        ref={fallbackCaptureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onFileSelected}
      />

      {state === 'idle' && (
        <div className="scan-actions">
          <button className="scan-btn primary" onClick={openCamera}>
            📸 {t('scan_open_camera')}
          </button>
          <button className="scan-btn" onClick={() => galleryInputRef.current?.click()}>
            🖼️ {t('scan_choose_gallery')}
          </button>
        </div>
      )}

      {state === 'camera' && (
        <div className="camera-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() =>
              console.log('[Scan] video loadedmetadata', videoRef.current?.videoWidth, videoRef.current?.videoHeight)
            }
            onPlaying={() => console.log('[Scan] video playing')}
            onError={(e) => console.error('[Scan] video element error', e)}
          />
          <div className="camera-controls">
            <button className="scan-btn" onClick={cancelCamera}>
              {t('scan_cancel')}
            </button>
            <button className="capture-ring" onClick={capturePhoto} aria-label={t('scan_capture')} />
          </div>
        </div>
      )}

      {state === 'preview' && previewUrl && (
        <div className="preview-view">
          <img src={previewUrl} alt="" className="preview-img" />
          <div className="preview-controls">
            <button className="scan-btn" onClick={retake}>
              {t('scan_retake')}
            </button>
            <button className="scan-btn primary" onClick={confirmAndAnalyze}>
              {t('scan_confirm')}
            </button>
          </div>
        </div>
      )}

      {state === 'analyzing' && (
        <div className="card analyzing-card">
          <div className="spinner" />
          <p>{t('scan_analyzing')}</p>
        </div>
      )}

      {state === 'assign' && assignMode === 'create' && (
        <>
          <div className="card intro-note">
            <p>{children.length === 0 ? t('child_first_intro') : t('child_new_title')}</p>
          </div>
          <ChildForm
            initialName={pendingResult?.detected_child_name ?? ''}
            initialClass={pendingResult?.detected_child_class ?? ''}
            onSave={handleCreateChild}
          />
        </>
      )}

      {state === 'assign' && assignMode === 'confirm' && matchedChild && (
        <div className="card assign-confirm-card">
          <p>
            {t('assign_confirm_prefix')}{' '}
            {isolateBidiRuns(matchedChild.schoolClass ? `${matchedChild.name} (${matchedChild.schoolClass})` : matchedChild.name)}
            {lang === 'ar' ? '؟' : '?'}
          </p>
          <div className="assign-confirm-actions">
            <button className="scan-btn primary" onClick={() => finalizeAssignment(matchedChild.id)}>
              {t('assign_confirm_yes')}
            </button>
            <button className="scan-btn" onClick={() => setAssignMode('pick')}>
              {t('assign_confirm_no')}
            </button>
          </div>
        </div>
      )}

      {state === 'assign' && assignMode === 'pick' && (
        <>
          <div className="sec">
            <h3>{t('assign_picker_title')}</h3>
          </div>
          <div className="assign-picker-list">
            {children.map((c) => (
              <button key={c.id} className="assign-child-btn" onClick={() => finalizeAssignment(c.id)}>
                <span className="assign-dot" style={{ background: c.color }} />
                {isolateBidiRuns(c.schoolClass ? `${c.name} (${c.schoolClass})` : c.name)}
              </button>
            ))}
            <button className="assign-child-btn" onClick={() => finalizeAssignment(ALL_CHILDREN)}>
              👨‍👩‍👧‍👦 {t('assign_all_children')}
            </button>
            <button className="assign-child-btn new-child" onClick={() => setAssignMode('create')}>
              + {t('child_new_title')}
            </button>
          </div>
        </>
      )}

      {state === 'error' && (
        <div className="card error-card">
          <p>{errorMessage}</p>
          <button className="scan-btn primary" onClick={retake}>
            {t('scan_try_again')}
          </button>
        </div>
      )}
    </FlowLayout>
  );
}
