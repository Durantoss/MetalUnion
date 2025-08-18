import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={() => onOpenChange(false)}
    >
      {children}
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function DialogContent({ children, className, 'data-testid': testId }: DialogContentProps) {
  return (
    <div
      className={className}
      data-testid={testId}
      style={{
        backgroundColor: '#000000',
        border: '1px solid #374151',
        borderRadius: '12px',
        maxWidth: '28rem',
        width: '100%',
        padding: '1.5rem',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}