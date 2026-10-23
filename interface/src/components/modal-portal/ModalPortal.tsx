import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: ReactNode;
  /** Opcional: sem ele, ESC aciona o clique no overlay (que ja fecha os modais existentes). */
  onClose?: () => void;
}

const FOCUSABLE = 'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function ModalPortal({ children, onClose }: ModalPortalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    const root = rootRef.current;
    const overlay = root?.querySelector<HTMLElement>('.modal-overlay') ?? null;
    const container = root?.querySelector<HTMLElement>('.modal-container') ?? null;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    container?.setAttribute('role', 'dialog');
    container?.setAttribute('aria-modal', 'true');
    const title = container?.querySelector<HTMLElement>('.modal-title');
    if (title && container) {
      title.id ||= `modal-title-${Math.random().toString(36).slice(2, 8)}`;
      container.setAttribute('aria-labelledby', title.id);
    }

    const firstField = container?.querySelector<HTMLElement>('.modal-body input, .modal-body select, .modal-body textarea');
    (firstField ?? container?.querySelector<HTMLElement>(FOCUSABLE) ?? container)?.focus({ preventScroll: true });

    function onKeyDown(e: KeyboardEvent) {
      // Com modais empilhados, so o do topo reage.
      const overlays = document.querySelectorAll('.modal-overlay');
      if (overlays[overlays.length - 1] !== overlay) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (onCloseRef.current) onCloseRef.current();
        else overlay?.click();
        return;
      }

      if (e.key === 'Tab' && container) {
        const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  return createPortal(<div ref={rootRef}>{children}</div>, document.body);
}
