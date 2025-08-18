import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          borderRadius: '8px',
          border: '1px solid #374151',
          backgroundColor: '#111827',
          textAlign: 'left',
          color: '#ffffff',
          ...props.style
        }}
        {...props}
      />
    );
  }
);

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
          padding: '1.5rem',
          paddingBottom: '0',
          ...props.style
        }}
        {...props}
      />
    );
  }
);

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={className}
        style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          lineHeight: '1.25',
          color: '#ffffff',
          margin: 0,
          ...props.style
        }}
        {...props}
      />
    );
  }
);

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={className}
        style={{
          fontSize: '0.875rem',
          color: '#9ca3af',
          margin: 0,
          ...props.style
        }}
        {...props}
      />
    );
  }
);

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          padding: '1.5rem',
          paddingTop: '0',
          ...props.style
        }}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';