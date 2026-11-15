import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from '../../components/Button.jsx';
import './driving.css';

export function ConfirmDialog({ open, title, children, confirmLabel = 'Discard', cancelLabel = 'Keep editing', onCancel, onConfirm, busy = false }) {
  const dialog = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const node = dialog.current;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
    return () => { if (node.open) node.close(); };
  }, [open]);
  return createPortal(<dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}
    className="driving-dialog m-auto w-[calc(100%_-_2rem)] max-w-md overflow-hidden rounded-card bg-surface p-0 text-ink shadow-xl">
    <h2 id={titleId} className="border-b border-line px-6 py-4 font-display text-lg font-semibold text-brand-900">{title}</h2>
    <div id={descriptionId} className="px-6 py-6 text-sm text-muted">{children}</div>
    <div className="flex justify-end gap-2 border-t border-line bg-brand-50 px-6 py-4">
      <Button variant="secondary" size="sm" autoFocus disabled={busy} onClick={onCancel}>{cancelLabel}</Button>
      <Button variant="danger" size="sm" disabled={busy} onClick={onConfirm}>{busy ? 'Please wait…' : confirmLabel}</Button>
    </div>
  </dialog>, document.body);
}
