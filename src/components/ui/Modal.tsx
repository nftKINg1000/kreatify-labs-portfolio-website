import { useEffect, useRef, type ReactNode } from 'react';
import { useLenis } from 'lenis/react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}

export function Modal({ open, onClose, label, children }: ModalProps) {
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis?.start();
    };
  }, [open, onClose, lenis]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 p-(--safe) backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-theme="dark"
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        className="dr-p-24 dt:dr-p-40 dr-rounded-12 relative max-h-[90svh] w-full overflow-y-auto border border-white/15 bg-primary dt:w-col-6"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="dr-w-40 dr-h-40 dr-top-16 dr-right-16 dr-rounded-8 absolute flex items-center justify-center border border-white/15 transition-colors duration-500 hover:border-sky hover:bg-sky hover:text-navy"
        >
          <X className="dr-w-20 dr-h-20" strokeWidth={1.5} />
        </button>
        {children}
      </div>
    </div>
  );
}
