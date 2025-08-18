import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    };

    const variants = {
      default: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
        '&:hover': { backgroundColor: '#b91c1c' }
      },
      destructive: {
        backgroundColor: '#dc2626',
        color: '#ffffff'
      },
      outline: {
        border: '1px solid #374151',
        backgroundColor: 'transparent',
        color: '#ffffff'
      },
      secondary: {
        backgroundColor: '#374151',
        color: '#ffffff'
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#ffffff'
      },
      link: {
        backgroundColor: 'transparent',
        color: '#dc2626',
        textDecoration: 'underline'
      }
    };

    const sizes = {
      default: { height: '2.5rem', padding: '0 1rem' },
      sm: { height: '2rem', padding: '0 0.75rem' },
      lg: { height: '3rem', padding: '0 2rem' },
      icon: { height: '2.5rem', width: '2.5rem' }
    };

    return (
      <button
        className={className}
        ref={ref}
        style={{
          ...baseStyle,
          ...variants[variant],
          ...sizes[size],
          ...props.style
        }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';