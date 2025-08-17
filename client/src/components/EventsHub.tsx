// DEPRECATED - This component has been replaced by EnhancedEventsPage
// This is now a simple placeholder to prevent import errors

interface EventsHubProps {
  featured?: boolean;
}

export function EventsHub({ featured = false }: EventsHubProps) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '12px',
      border: '1px solid rgba(153, 27, 27, 0.5)'
    }}>
      <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>
        Events Hub Moved
      </h3>
      <p style={{ color: '#d1d5db' }}>
        The events functionality has been moved to the dedicated Event Discovery section.
        Use the main navigation to access AI-powered event recommendations!
      </p>
    </div>
  );
}