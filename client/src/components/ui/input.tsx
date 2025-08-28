import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={className}
        ref={ref}
        style={{
          flex: '1',
          padding: '0.75rem',
          fontSize: '0.875rem',
          borderRadius: '6px',
          border: '1px solid #374151',
          backgroundColor: '#111827',
          color: '#ffffff',
          outline: 'none',
          width: '100%',
          ...props.style
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';