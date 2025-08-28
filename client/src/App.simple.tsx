import { useState } from 'react';
import { MessagingDemo } from './pages/MessagingDemo';

export default function App() {
  const [currentSection, setCurrentSection] = useState('messaging-demo');
  
  console.log('Simple App rendering...');
  
  // Simple navigation
  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-500">MoshUnion</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => handleSectionChange('landing')}
                className={`px-4 py-2 rounded ${currentSection === 'landing' ? 'bg-red-600 text-white' : 'hover:bg-red-100'}`}
              >
                Home
              </button>
              <button
                onClick={() => handleSectionChange('messaging-demo')}
                className={`px-4 py-2 rounded ${currentSection === 'messaging-demo' ? 'bg-red-600 text-white' : 'hover:bg-red-100'}`}
              >
                Messaging Demo
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentSection === 'landing' && (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Welcome to MoshUnion</h2>
            <p className="text-xl text-muted-foreground mb-8">
              The ultimate platform for metal and rock fans
            </p>
            <button
              onClick={() => handleSectionChange('messaging-demo')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Try Group Chat Demo
            </button>
          </div>
        )}

        {currentSection === 'messaging-demo' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Encrypted Messaging System</h2>
            <MessagingDemo />
          </div>
        )}
      </main>
    </div>
  );
}