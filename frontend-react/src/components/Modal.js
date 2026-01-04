import React from 'react';

export function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center animate-fade-in p-4 pt-20 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative card w-full max-w-2xl animate-pop-in flex flex-col my-auto">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="btn btn-tertiary" onClick={onClose}>✕</button>
        </div>
        <div className="overflow-y-auto flex-1 pr-2" style={{ maxHeight: 'calc(90vh - 160px)' }}>{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 flex-shrink-0 mt-3 border-t pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
