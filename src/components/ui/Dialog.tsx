import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Visually hide the title (it is still the dialog's accessible name). */
  hideTitle?: boolean;
  children: ReactNode;
  /** Extra classes for the panel. */
  className?: string;
  /** Element to focus first; defaults to the panel heading. */
  initialFocus?: () => HTMLElement | null;
  variant?: 'panel' | 'fullscreen';
  theme?: 'dark' | 'light';
  id?: string;
  /** Set `current = false` before closing to skip focus return (e.g. when navigating elsewhere). */
  returnFocusRef?: { current: boolean };
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Native modal dialog. `showModal()` makes the rest of the page inert; we add a Tab
 * wrap so focus cannot leave via the browser chrome, Escape/backdrop close, scroll
 * lock, and focus return to the exact element that opened it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  hideTitle = false,
  children,
  className = '',
  initialFocus,
  variant = 'panel',
  theme = 'dark',
  id,
  returnFocusRef,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const invokerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  const returnRef = useRef(returnFocusRef);
  useEffect(() => {
    onCloseRef.current = onClose;
    returnRef.current = returnFocusRef;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      invokerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      document.documentElement.classList.add('dialog-open');
      const target = initialFocus?.() ?? titleRef.current;
      target?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const restore = () => {
      document.documentElement.classList.remove('dialog-open');
      const invoker = invokerRef.current;
      invokerRef.current = null;
      const shouldReturn = returnRef.current?.current ?? true;
      if (returnRef.current) returnRef.current.current = true;
      if (shouldReturn && invoker?.isConnected) invoker.focus();
    };
    const onCancel = (event: Event) => {
      event.preventDefault(); // keep state in React; close through onClose
      onCloseRef.current();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => !el.closest('[hidden], [inert], [aria-hidden="true"]') && getComputedStyle(el).visibility !== 'hidden',
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) onCloseRef.current(); // backdrop
    };

    dialog.addEventListener('close', restore);
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('keydown', onKeyDown);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('close', restore);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('keydown', onKeyDown);
      dialog.removeEventListener('click', onClick);
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      id={id}
      data-theme={theme}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={`kl-dialog kl-dialog--${variant}`}
    >
      <div className={`kl-dialog__panel ${className}`}>
        <div className="kl-dialog__header">
          <h2 id={titleId} ref={titleRef} tabIndex={-1} className={hideTitle ? 'sr-only' : 'h4'}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Close">
            <X aria-hidden="true" strokeWidth={1.75} />
          </button>
        </div>
        {description && (
          <p id={descriptionId} className="p-r muted kl-dialog__description">
            {description}
          </p>
        )}
        {open && children}
      </div>
    </dialog>
  );
}
