import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  className?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: '#93c5fd'
      },
      destructive: {
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        color: '#fca5a5'
      }
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '6px',
          padding: '1rem',
          fontSize: '0.875rem',
          ...variants[variant],
          ...props.style
        }}
        {...props}
      />
    );
  }
);

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          margin: 0,
          ...props.style
        }}
        {...props}
      />
    );
  }
);

Alert.displayName = 'Alert';
AlertDescription.displayName = 'AlertDescription';