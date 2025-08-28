import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, className = '' }) => {
  const percent = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div className={`progress-container ${className}`} style={progressStyles.container}>
      <div style={progressStyles.wrapper}>
        <div style={progressStyles.track}>
          <div 
            style={{
              ...progressStyles.fill,
              width: `${percent}%`
            }}
          />
        </div>
        <div style={progressStyles.text}>
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    </div>
  );
};

const progressStyles = {
  container: {
    width: '100%',
    marginBottom: '2rem',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  track: {
    width: '100%',
    height: '8px',
    background: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #B00020 0%, #dc2626 50%, #B00020 100%)',
    borderRadius: '3px',
    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  text: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    fontWeight: '600',
    textAlign: 'center' as const,
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
};

export default ProgressBar;
