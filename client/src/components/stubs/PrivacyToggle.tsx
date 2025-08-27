import { PrivacyToggleProps } from '../../types';

export default function PrivacyToggle({ value, onChange }: PrivacyToggleProps) {
  const privacyOptions = [
    {
      value: 'public' as const,
      label: 'Public',
      icon: '🌍',
      description: 'Visible to everyone',
      color: 'text-green-400'
    },
    {
      value: 'friends' as const,
      label: 'Friends Only',
      icon: '👥',
      description: 'Only your friends can see',
      color: 'text-blue-400'
    },
    {
      value: 'private' as const,
      label: 'Private',
      icon: '🔒',
      description: 'Only you can see',
      color: 'text-metal-red-bright'
    }
  ];

  const selectedOption = privacyOptions.find(option => option.value === value);

  return (
    <div className="privacy-toggle bg-card-dark rounded-lg p-4 border border-metal-gray/50">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-text-secondary mb-1">Privacy Setting</h4>
        <p className="text-xs text-text-muted">
          Control who can see this stub
        </p>
      </div>

      {/* Custom select dropdown */}
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value as 'public' | 'friends' | 'private')}
          className="w-full px-4 py-3 bg-metal-black border border-metal-gray rounded-lg text-primary appearance-none cursor-pointer focus:border-metal-red focus:ring-2 focus:ring-metal-red/20 transition-all"
        >
          {privacyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label} - {option.description}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Visual privacy indicator */}
      {selectedOption && (
        <div className="mt-3 p-3 bg-metal-gray/10 rounded-lg border border-metal-gray/20">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{selectedOption.icon}</div>
            <div className="flex-1">
              <div className={`font-medium ${selectedOption.color}`}>
                {selectedOption.label}
              </div>
              <div className="text-xs text-text-muted">
                {selectedOption.description}
              </div>
            </div>
            <div className="text-xs text-text-muted">
              {value === 'public' && '✓ Discoverable'}
              {value === 'friends' && '✓ Shared'}
              {value === 'private' && '✓ Secure'}
            </div>
          </div>
        </div>
      )}

      {/* Privacy explanation */}
      <div className="mt-4 space-y-2 text-xs text-text-muted">
        <div className="flex items-start gap-2">
          <span className="text-green-400">🌍</span>
          <div>
            <span className="font-medium text-green-400">Public:</span> Anyone can discover and view this stub in feeds and searches
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-blue-400">👥</span>
          <div>
            <span className="font-medium text-blue-400">Friends:</span> Only people you've connected with can see this stub
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-metal-red-bright">🔒</span>
          <div>
            <span className="font-medium text-metal-red-bright">Private:</span> Only visible in your personal collection
          </div>
        </div>
      </div>

      {/* Privacy tips */}
      <div className="mt-4 p-3 bg-metal-red/10 rounded-lg border border-metal-red/20">
        <div className="flex items-start gap-2 text-xs">
          <span className="text-metal-red-bright">💡</span>
          <div className="text-text-muted">
            <span className="font-medium text-metal-red-bright">Tip:</span> You can change privacy settings anytime. 
            {value === 'private' && ' Private stubs won\'t appear in your public profile.'}
            {value === 'friends' && ' Friends will see this in their feed and your profile.'}
            {value === 'public' && ' Public stubs help others discover similar music tastes!'}
          </div>
        </div>
      </div>
    </div>
  );
}
