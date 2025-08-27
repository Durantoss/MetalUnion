import { useState } from 'react';
import { 
  StubLink, 
  StubCard, 
  MemoryWall, 
  TimelinePulse, 
  FanCollab, 
  PrivacyToggle,
  Stub,
  StubSubmission
} from './index';

// Sample stub data for demonstration
const sampleStubs: Stub[] = [
  {
    id: '1',
    user_id: 'user1',
    artist: 'Metallica',
    venue: 'Madison Square Garden',
    date: '2024-03-15',
    genre: 'thrash',
    image_url: 'https://via.placeholder.com/400x400/dc2626/ffffff?text=Metallica',
    tags: ['legendary', 'headbanging', 'epic'],
    friends: ['John', 'Sarah'],
    privacy: 'public'
  },
  {
    id: '2',
    user_id: 'user1',
    artist: 'Sleep Token',
    venue: 'The Fillmore',
    date: '2024-01-20',
    genre: 'metalcore',
    stub_url: 'https://example.com/stub2',
    tags: ['atmospheric', 'emotional'],
    friends: ['Mike'],
    privacy: 'friends'
  },
  {
    id: '3',
    user_id: 'user1',
    artist: 'Electric Wizard',
    venue: 'Brooklyn Bowl',
    date: '2023-10-31',
    genre: 'doom',
    image_url: 'https://via.placeholder.com/400x400/000000/ffffff?text=Electric+Wizard',
    tags: ['heavy', 'halloween', 'crushing'],
    friends: [],
    privacy: 'private'
  },
  {
    id: '4',
    user_id: 'user1',
    artist: 'Architects',
    venue: 'Red Rocks Amphitheatre',
    date: '2024-07-04',
    genre: 'metalcore',
    image_url: 'https://via.placeholder.com/400x400/eab308/000000?text=Architects',
    tags: ['outdoor', 'amazing-view', 'progressive'],
    friends: ['Alex', 'Emma', 'Chris'],
    privacy: 'public'
  }
];

export default function StubDemo() {
  const [stubs, setStubs] = useState<Stub[]>(sampleStubs);
  const [selectedStub, setSelectedStub] = useState<Stub>(sampleStubs[0]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [activeView, setActiveView] = useState<'wall' | 'timeline' | 'single'>('wall');

  const handleStubSubmit = (submission: StubSubmission) => {
    console.log('New stub submitted:', submission);
    // In a real app, this would create a new stub and add it to the database
    alert('Stub submitted! (This is just a demo)');
  };

  const handleTagFriend = (friendName: string) => {
    setSelectedStub(prev => ({
      ...prev,
      friends: [...prev.friends, friendName]
    }));
    
    // Update the stub in the main list too
    setStubs(prev => prev.map(stub => 
      stub.id === selectedStub.id 
        ? { ...stub, friends: [...stub.friends, friendName] }
        : stub
    ));
  };

  const handlePrivacyChange = (newPrivacy: 'public' | 'friends' | 'private') => {
    setPrivacy(newPrivacy);
    setSelectedStub(prev => ({ ...prev, privacy: newPrivacy }));
  };

  return (
    <div className="stub-demo-container max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-metal-red-bright mb-4 heading-enhanced">
          🎫 Concert Stub Collection Demo
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Experience the complete concert stub management system with all integrated components.
          This demo showcases how fans can collect, organize, and share their concert memories.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveView('wall')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeView === 'wall'
              ? 'bg-metal-red text-primary'
              : 'bg-card-dark text-text-secondary hover:bg-metal-gray/20'
          }`}
        >
          Memory Wall
        </button>
        <button
          onClick={() => setActiveView('timeline')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeView === 'timeline'
              ? 'bg-metal-red text-primary'
              : 'bg-card-dark text-text-secondary hover:bg-metal-gray/20'
          }`}
        >
          Timeline View
        </button>
        <button
          onClick={() => setActiveView('single')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeView === 'single'
              ? 'bg-metal-red text-primary'
              : 'bg-card-dark text-text-secondary hover:bg-metal-gray/20'
          }`}
        >
          Single Stub Demo
        </button>
      </div>

      {/* Add New Stub Section */}
      <div className="bg-metal-black/50 rounded-xl p-6 border border-metal-gray/30">
        <h2 className="text-2xl font-bold text-metal-red-bright mb-4 heading-enhanced">
          Add New Stub
        </h2>
        <StubLink onSubmit={handleStubSubmit} />
      </div>

      {/* Main Content Area */}
      <div className="min-h-screen">
        {activeView === 'wall' && (
          <div>
            <MemoryWall stubs={stubs} />
          </div>
        )}

        {activeView === 'timeline' && (
          <div>
            <TimelinePulse stubs={stubs} />
          </div>
        )}

        {activeView === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Stub Card and Controls */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-metal-red-bright mb-4 heading-enhanced">
                  Featured Stub
                </h3>
                <div className="max-w-sm mx-auto">
                  <StubCard stub={selectedStub} genre={selectedStub.genre} />
                </div>
              </div>

              {/* Stub Selector */}
              <div className="bg-card-dark rounded-lg p-4 border border-metal-gray/50">
                <h4 className="text-sm font-medium text-text-secondary mb-3">
                  Select Different Stub
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {stubs.map((stub) => (
                    <button
                      key={stub.id}
                      onClick={() => setSelectedStub(stub)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        selectedStub.id === stub.id
                          ? 'bg-metal-red/20 border border-metal-red/50'
                          : 'bg-metal-gray/10 hover:bg-metal-gray/20'
                      }`}
                    >
                      <div className="font-medium text-sm text-primary">
                        {stub.artist}
                      </div>
                      <div className="text-xs text-text-muted">
                        {stub.venue}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Toggle */}
              <PrivacyToggle value={privacy} onChange={handlePrivacyChange} />
            </div>

            {/* Right Column - Fan Collaboration */}
            <div>
              <h3 className="text-xl font-bold text-metal-red-bright mb-4 heading-enhanced">
                Social Features
              </h3>
              <FanCollab stub={selectedStub} onTag={handleTagFriend} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-12 p-6 bg-metal-gray/10 rounded-lg border border-metal-gray/20">
        <h3 className="text-lg font-bold text-metal-red-bright mb-3">
          🎸 About This Demo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div>
            <h4 className="font-medium text-primary mb-2">Features Demonstrated:</h4>
            <ul className="space-y-1 text-text-muted">
              <li>• Concert stub submission with URL/image upload</li>
              <li>• Genre-specific visual styling (thrash, doom, metalcore)</li>
              <li>• Memory wall grid layout with hover effects</li>
              <li>• Timeline view with chronological organization</li>
              <li>• Friend tagging and social collaboration</li>
              <li>• Privacy controls (public, friends, private)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-primary mb-2">Technical Integration:</h4>
            <ul className="space-y-1 text-text-muted">
              <li>• TypeScript interfaces for type safety</li>
              <li>• Responsive design with mobile optimization</li>
              <li>• Consistent styling with project theme</li>
              <li>• Component composition and reusability</li>
              <li>• State management for interactive features</li>
              <li>• Database schema compatibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
