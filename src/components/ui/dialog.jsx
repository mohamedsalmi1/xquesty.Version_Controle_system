import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Dialog: Accessible Modal with overlay, animation, escape/click-away support
// Props:
// - open: boolean show/hide
// - onClose: () => void
// - title: string (optional, for aria-labeling)
// - children: content
// - mobileFullscreen: boolean
export function Dialog({ open, onClose, title, children, mobileFullscreen = false }) {
  const backdropRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Click outside to close
  function onBackdropClick(e) {
    if (e.target === backdropRef.current) {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          style={{ touchAction: "none" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          onClick={onBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? "dialog-title" : undefined}
        >
          <motion.div
            className={`
              ${mobileFullscreen
                ? 'w-full h-[100dvh] fixed top-0 left-0 bg-white dark:bg-slate-900 rounded-none overflow-y-auto'
                : 'w-[95vw] max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl m-4 max-h-[90vh] overflow-y-auto'
              }
              flex flex-col outline-none
            `}
            initial={{
              y: mobileFullscreen ? 40 : 32,
              opacity: 0,
              scale: mobileFullscreen ? 1 : 0.98
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
              transition: { type: "spring", duration: 0.4 }
            }}
            exit={{
              y: mobileFullscreen ? 40 : 32,
              opacity: 0,
              scale: mobileFullscreen ? 1 : 0.98,
              transition: { duration: 0.2 }
            }}
            tabIndex={-1}
            role="document"
          >
            {title && (
              <h2
                id="dialog-title"
                className="text-2xl font-bold px-6 pt-6 pb-2 mb-1"
              >
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}