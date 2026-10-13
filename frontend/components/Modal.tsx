"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ children, onClose, label, className = "" }: { children: ReactNode; onClose: () => void; label: string; className?: string }) {
  useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
        {children}
      </section>
    </div>
  );
}

