import { useState } from 'react';
import { FanCollabProps } from '../../types';

export default function FanCollab({ stub, onTag }: FanCollabProps) {
  const [friendName, setFriendName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTag = () => {
    if (friendName.trim() && !stub.friends.includes(friendName.trim())) {
      setIsAdding(true);
      onTag(friendName.trim());
      setFriendName('');
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <div className="fan-collab bg-card-dark rounded-lg p-6 border border-metal-gray/50">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-metal-red-bright mb-2 heading-enhanced">
          Tag Friends
        </h3>
        <p className="text-sm text-text-secondary">
          Who was at this show with you?
        </p>
      </div>

      {/* Add friend input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter friend's name"
          value={friendName}
          onChange={(e) => setFriendName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-2 bg-metal-black border border-metal-gray rounded-lg text-primary placeholder-text-muted focus:border-metal-red focus:ring-2 focus:ring-metal-red/20 transition-all"
          disabled={isAdding}
        />
        <button 
          onClick={handleAddTag}
          disabled={!friendName.trim() || stub.friends.includes(friendName.trim()) || isAdding}
          className="px-4 py-2 bg-metal-red hover:bg-metal-red-bright disabled:bg-metal-gray disabled:cursor-not-allowed text-primary font-medium rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02] active:scale-[0.98] touch-target"
        >
          {isAdding ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </div>
          ) : (
            'Add Tag'
          )}
        </button>
      </div>

      {/* Tagged friends display */}
      <div className="tagged-friends">
        {stub.friends.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-3">
              Tagged Friends ({stub.friends.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {stub.friends.map((friend, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-2 px-3 py-2 bg-metal-red/20 border border-metal-red/30 rounded-full text-sm text-metal-red-bright hover:bg-metal-red/30 transition-all"
                >
                  <span className="text-xs">👤</span>
                  <span className="font-medium">{friend}</span>
                  <button 
                    onClick={() => {
                      // Remove friend functionality could be added here
                      console.log('Remove friend:', friend);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-1 text-xs hover:text-primary transition-all"
                    title="Remove tag"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm">No friends tagged yet</p>
            <p className="text-xs mt-1">Add friends who were at this show!</p>
          </div>
        )}
      </div>

      {/* Concert context */}
      <div className="mt-6 pt-4 border-t border-metal-gray/30">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <div className="flex items-center gap-1">
            <span>🎤</span>
            <span className="font-medium text-primary">{stub.artist}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{stub.venue}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{new Date(stub.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Social sharing hint */}
      {stub.friends.length > 0 && (
        <div className="mt-4 p-3 bg-metal-gray/10 rounded-lg border border-metal-gray/20">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>💡</span>
            <span>Tagged friends will be notified about this memory!</span>
          </div>
        </div>
      )}
    </div>
  );
}
