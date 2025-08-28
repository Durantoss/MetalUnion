import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={className}
        style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#d1d5db',
          display: 'block',
          marginBottom: '0.5rem',
          ...props.style
        }}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';