const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
        {/* Backdrop */}
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            transition: 'opacity 0.3s'
          }}
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className="card-3d card-glass animate-scale-in"
          style={{
            position: 'relative',
            maxWidth: '28rem',
            width: '100%',
            padding: '1.5rem'
          }}
        >
          {/* Title */}
          {title && (
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>{title}</h3>
          )}

          {/* Content */}
          <div style={{ marginBottom: '1.5rem' }}>
            {children}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
