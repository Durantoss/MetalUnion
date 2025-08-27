import StubCard from './StubCard';
import { MemoryWallProps } from '../../types';

export default function MemoryWall({ stubs }: MemoryWallProps) {
  if (stubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">🎫</div>
        <h3 className="text-xl font-bold text-metal-red-bright mb-2">No Stubs Yet</h3>
        <p className="text-text-muted text-center max-w-md">
          Start building your concert memory wall by adding your first stub!
        </p>
      </div>
    );
  }

  return (
    <div className="memory-wall-container">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-metal-red-bright mb-2 heading-enhanced">
          Memory Wall
        </h2>
        <p className="text-text-secondary">
          Your collection of concert memories ({stubs.length} stub{stubs.length !== 1 ? 's' : ''})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mobile-grid">
        {stubs.map((stub) => (
          <div key={stub.id} className="mobile-card">
            <StubCard stub={stub} genre={stub.genre} />
          </div>
        ))}
      </div>

      {/* Genre filter indicators */}
      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        {Array.from(new Set(stubs.map(stub => stub.genre))).map((genre) => {
          const count = stubs.filter(stub => stub.genre === genre).length;
          return (
            <div 
              key={genre}
              className="px-3 py-1 bg-metal-gray/20 border border-metal-gray/50 rounded-full text-sm text-text-secondary"
            >
              {genre}: {count}
            </div>
          );
        })}
      </div>
    </div>
  );
}
