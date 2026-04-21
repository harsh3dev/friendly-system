import { useEffect, useRef } from 'react';

let scrollLockCount = 0;
let originalBodyOverflow = '';

function lockBodyScroll() {
  if (typeof document === 'undefined') return;

  if (scrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  scrollLockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === 'undefined' || scrollLockCount === 0) return;

  scrollLockCount -= 1;

  if (scrollLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
  }
}

export function useOverlayBehavior(onClose: () => void) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    lockBodyScroll();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
    };
  }, []);
}
