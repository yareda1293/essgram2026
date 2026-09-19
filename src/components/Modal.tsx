import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxHeight?: string;
}

export function BottomSheet({ open, onClose, title, children, maxHeight = '85vh' }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md bg-ink-800 rounded-t-3xl border-t border-white/10 shadow-float animate-slide-in-up safe-bottom"
        style={{ maxHeight }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-ink-400" />
        </div>
        {title && (
          <div className="px-5 py-3 border-b border-white/5">
            <h2 className="font-display text-lg font-semibold text-ink-50">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 60px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-sm bg-ink-700 rounded-3xl border border-white/10 shadow-float animate-scale-in',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, danger,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onCancel}>
      <div className="p-6 text-center">
        <h3 className="font-display text-lg font-semibold text-ink-50 mb-2">{title}</h3>
        <p className="text-sm text-ink-300 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-medium text-sm text-ink-100 bg-white/5 hover:bg-white/10 transition-colors active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95',
              danger ? 'bg-error-500 hover:bg-error-600' : 'accent-bg hover:opacity-90'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
