import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={className}
        style={{
          width: '1rem',
          height: '1rem',
          borderRadius: '2px',
          border: '1px solid #374151',
          backgroundColor: '#111827',
          accentColor: '#dc2626',
          ...props.style
        }}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';