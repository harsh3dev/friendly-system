import { useState, useCallback, useEffect } from 'react';
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
  const [closeTimerId, setCloseTimerId] = useState<number | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => {
      cancelAnimationFrame(id);
    };
  }, []);

  useEffect(() => {
    if (closeTimerId === null) return undefined;
    return () => {
      window.clearTimeout(closeTimerId);
    };
  }, [closeTimerId]);

  const close = useCallback(() => {
    setOpen(false);
    setCloseTimerId((prev) => {
      if (prev !== null) {
        window.clearTimeout(prev);
      }
      return window.setTimeout(() => {
        setCloseTimerId(null);
        onClose();
      }, EXIT_MS);
    });
  }, [onClose]);

  useOverlayBehavior(close);

  return createPortal(
    <motion.div
      animate={{ opacity: open ? 1 : 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: EXIT_MS / 1000, ease: 'easeOut' }}
      className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/50 p-4 sm:place-items-center"
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
