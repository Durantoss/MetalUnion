import StubCard from './StubCard';
import { TimelinePulseProps } from '../../types';

export default function TimelinePulse({ stubs }: TimelinePulseProps) {
  const sorted = [...stubs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">⏰</div>
        <h3 className="text-xl font-bold text-metal-red-bright mb-2">No Timeline Yet</h3>
        <p className="text-text-muted text-center max-w-md">
          Your concert timeline will appear here as you add stubs!
        </p>
      </div>
    );
  }

  const groupByYear = (stubs: typeof sorted) => {
    return stubs.reduce((groups, stub) => {
      const year = new Date(stub.date).getFullYear();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(stub);
      return groups;
    }, {} as Record<number, typeof sorted>);
  };

  const groupedStubs = groupByYear(sorted);
  const years = Object.keys(groupedStubs).map(Number).sort((a, b) => b - a);

  return (
    <div className="timeline-pulse-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-metal-red-bright mb-2 heading-enhanced">
          Timeline Pulse
        </h2>
        <p className="text-text-secondary">
          Your concert journey through time ({sorted.length} show{sorted.length !== 1 ? 's' : ''})
        </p>
      </div>

      <div className="timeline relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-metal-red via-metal-red-bright to-metal-red opacity-50"></div>

        {years.map((year) => (
          <div key={year} className="year-section mb-12">
            {/* Year marker */}
            <div className="flex items-center mb-6">
              <div className="relative z-10 bg-metal-red text-primary px-4 py-2 rounded-full font-bold text-lg border-4 border-metal-black">
                {year}
              </div>
              <div className="flex-1 h-0.5 bg-metal-gray ml-4"></div>
            </div>

            {/* Stubs for this year */}
            <div className="space-y-8 ml-16">
              {groupedStubs[year].map((stub, index) => (
                <div key={stub.id} className="timeline-item relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-20 top-4 w-4 h-4 bg-metal-red-bright rounded-full border-4 border-metal-black z-10 genre-pulse"></div>
                  
                  {/* Timeline connector */}
                  <div className="absolute -left-18 top-8 w-12 h-0.5 bg-metal-gray"></div>

                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Stub card */}
                    <div className="w-full md:w-64 flex-shrink-0">
                      <StubCard stub={stub} genre={stub.genre} />
                    </div>

                    {/* Stub details */}
                    <div className="flex-1 bg-card-dark rounded-lg p-4 border border-metal-gray/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-metal-red-bright">
                          {new Date(stub.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-text-muted">
                          #{index + 1} of {groupedStubs[year].length}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-primary mb-1 band-name">
                        {stub.artist}
                      </h3>
                      
                      <p className="text-text-secondary mb-2">
                        📍 {stub.venue}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-metal-red/20 text-metal-red-bright text-xs rounded-full border border-metal-red/30">
                          {stub.genre}
                        </span>
                        {stub.friends.length > 0 && (
                          <span className="text-xs text-text-muted">
                            👥 {stub.friends.length} friend{stub.friends.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {stub.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {stub.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="px-2 py-1 bg-metal-gray/20 text-text-muted text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-dark rounded-lg p-4 border border-metal-gray/50 text-center">
          <div className="text-2xl font-bold text-metal-red-bright">
            {sorted.length}
          </div>
          <div className="text-sm text-text-secondary">Total Shows</div>
        </div>
        
        <div className="bg-card-dark rounded-lg p-4 border border-metal-gray/50 text-center">
          <div className="text-2xl font-bold text-metal-red-bright">
            {years.length}
          </div>
          <div className="text-sm text-text-secondary">Years Active</div>
        </div>
        
        <div className="bg-card-dark rounded-lg p-4 border border-metal-gray/50 text-center">
          <div className="text-2xl font-bold text-metal-red-bright">
            {Array.from(new Set(sorted.map(s => s.venue))).length}
          </div>
          <div className="text-sm text-text-secondary">Unique Venues</div>
        </div>
      </div>
    </div>
  );
}
