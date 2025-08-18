import React from 'react';
import { AuthGuard } from './AuthGuard';

interface InteractionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  action: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

export function InteractionButton({
  onClick,
  children,
  action,
  style,
  className,
  disabled,
  'data-testid': testId
}: InteractionButtonProps) {
  return (
    <AuthGuard
      action={action}
      fallback={
        <div
          style={{
            ...style,
            opacity: 0.6,
            cursor: 'pointer',
            position: 'relative'
          }}
          className={className}
          data-testid={testId}
          onClick={() => {
            // Show auth modal when clicked
            const event = new CustomEvent('auth-required', {
              detail: { action }
            });
            window.dispatchEvent(event);
          }}
        >
          {children}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#facc15',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            Sign up required
          </div>
        </div>
      }
    >
      <button
        onClick={onClick}
        style={style}
        className={className}
        disabled={disabled}
        data-testid={testId}
      >
        {children}
      </button>
    </AuthGuard>
  );
}