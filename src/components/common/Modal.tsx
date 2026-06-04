import { useEffect, type ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  confirmVariant?: 'brand' | 'danger';
  cancelText?: string;
  confirmDisabled?: boolean;
  children?: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
}

export function Modal({
  isOpen,
  title,
  description,
  confirmText = '확인',
  confirmVariant = 'brand',
  cancelText,
  confirmDisabled = false,
  children,
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
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex gap-2">
          {cancelText ? (
            <Button className="flex-1" onClick={onClose} variant="secondary">
              {cancelText}
            </Button>
          ) : null}
          <Button
            className="flex-1 rounded-xl"
            disabled={confirmDisabled}
            onClick={onConfirm ?? onClose}
            variant={confirmVariant}
          >
            {confirmText}
          </Button>
        </div>
      </section>
    </div>
  );
}
