import React from 'react';

interface InteractionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  action: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
  onTouchStart?: () => void;
}

export function InteractionButton({
  onClick,
  children,
  action,
  style,
  className,
  disabled,
  'data-testid': testId,
  onTouchStart
}: InteractionButtonProps) {
  // Simple authentication check - always show auth required for now
  const isAuthenticated = false; // TODO: Connect to real auth system
  
  const handleClick = () => {
    if (!isAuthenticated) {
      // Trigger auth modal via global event
      const event = new CustomEvent('auth-required', {
        detail: { action }
      });
      window.dispatchEvent(event);
    } else {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={onTouchStart}
      style={{
        ...style,
        position: 'relative'
      }}
      className={className}
      disabled={disabled}
      data-testid={testId}
    >
      {children}
      {!isAuthenticated && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#facc15',
          color: '#000000',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '0.6rem',
          fontWeight: '700',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          🔒
        </div>
      )}
    </button>
  );
}