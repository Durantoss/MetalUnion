import { StubCardProps } from '../../types';

export default function StubCard({ stub, genre }: StubCardProps) {
  const frameStyles = {
    thrash: 'border-4 border-metal-red glow-fire',
    doom: 'border-4 border-metal-black pulse-slow shadow-2xl',
    metalcore: 'border-4 border-electric-yellow glow-lightning',
    default: 'border-4 border-metal-gray'
  };

  const getFrameStyle = (genreKey: string) => {
    return frameStyles[genreKey as keyof typeof frameStyles] || frameStyles.default;
  };

  return (
    <div className={`stub-card relative group overflow-hidden rounded-lg bg-card-dark ${getFrameStyle(genre)} transition-all duration-300 hover:transform hover:scale-[1.02] hover-lift`}>
      <div className="aspect-square relative overflow-hidden">
        {stub.image_url ? (
          <img 
            src={stub.image_url} 
            alt={`${stub.artist} at ${stub.venue}`} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
          />
        ) : stub.stub_url ? (
          <iframe 
            src={stub.stub_url} 
            className="w-full h-full border-0" 
            title={`${stub.artist} stub`}
          />
        ) : (
          <div className="w-full h-full bg-metal-gray flex items-center justify-center">
            <div className="text-center text-text-muted">
              <div className="text-4xl mb-2">🎫</div>
              <p className="text-sm">No image available</p>
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-metal-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Hover details */}
      <div className="hover-details absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
        <div className="bg-metal-black/90 backdrop-blur-sm rounded-lg p-3 border border-metal-gray/50">
          <h3 className="font-bold text-metal-red-bright text-lg mb-1 band-name">
            {stub.artist}
          </h3>
          <p className="text-text-secondary text-sm mb-1">
            📍 {stub.venue}
          </p>
          <p className="text-text-muted text-xs mb-2">
            📅 {new Date(stub.date).toLocaleDateString()}
          </p>
          {stub.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {stub.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-metal-red/20 text-metal-red-bright text-xs rounded-full border border-metal-red/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Privacy indicator */}
      {stub.privacy !== 'public' && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-metal-black/80 backdrop-blur-sm rounded-full p-2 border border-metal-gray/50">
            <span className="text-xs text-metal-red-bright">
              {stub.privacy === 'private' ? '🔒' : '👥'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
