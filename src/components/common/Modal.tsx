import { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export function Modal({
  isOpen,
  title,
  description,
  confirmText = '확인',
  cancelText,
  onClose,
  onConfirm,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
        <div className="mt-6 flex gap-2">
          {cancelText ? (
            <Button className="flex-1" onClick={onClose} variant="secondary">
              {cancelText}
            </Button>
          ) : null}
          <Button className="flex-1 rounded-xl" onClick={onConfirm ?? onClose} variant="brand">
            {confirmText}
          </Button>
        </div>
      </section>
    </div>
  );
}
