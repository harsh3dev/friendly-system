import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useOverlayBehavior } from '@/components/ui/use-overlay-behavior';

type Props = {
  onClose: () => void;
  children: (close: () => void) => React.ReactNode;
  className?: string;
};

const EXIT_MS = 180;

export function Modal({ onClose, children, className }: Props) {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => {
      cancelAnimationFrame(id);
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useOverlayBehavior(close);

  return createPortal(
    <motion.div
      animate={{ opacity: open ? 1 : 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: EXIT_MS / 1000, ease: 'easeOut' }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={e => e.target === e.currentTarget && close()}
    >
      <motion.div
        animate={open ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: EXIT_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full ${className ?? ''}`}
      >
        {children(close)}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
