import { useState } from 'react';
import Header from './Header';

export default function HeaderDemo() {
  const [currentSection, setCurrentSection] = useState('landing');

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    console.log('Section changed to:', section);
  };

  const handleReturnHome = () => {
    setCurrentSection('landing');
    console.log('Returned to home');
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'memories':
        return (
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Memories</h1>
            <p className="text-white text-lg">Share and explore concert memories, photos, and experiences from the pit!</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-red-700">
                <h3 className="text-xl font-bold text-red-400 mb-2">Concert Photos</h3>
                <p className="text-gray-300">Upload and share your best concert photography</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-red-700">
                <h3 className="text-xl font-bold text-red-400 mb-2">Show Reviews</h3>
                <p className="text-gray-300">Write reviews of shows you've attended</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-red-700">
                <h3 className="text-xl font-bold text-red-400 mb-2">Memory Timeline</h3>
                <p className="text-gray-300">Track your concert history and experiences</p>
              </div>
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Collab Wall</h1>
            <p className="text-white text-lg">Connect with fellow metalheads and collaborate on projects!</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-red-700">
                <h3 className="text-xl font-bold text-red-400 mb-2">Band Collaborations</h3>
                <p className="text-gray-300">Find musicians to jam with or form new bands</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-red-700">
                <h3 className="text-xl font-bold text-red-400 mb-2">Community Projects</h3>
                <p className="text-gray-300">Join community-driven metal projects and initiatives</p>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Profile</h1>
            <p className="text-white text-lg">Manage your MoshUnion profile and preferences</p>
            <div className="mt-8 max-w-md mx-auto bg-gray-800 p-6 rounded-lg border border-red-700">
              <div className="w-24 h-24 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">MU</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Metal Fan</h3>
              <p className="text-gray-300 mb-4">Passionate about heavy music and live shows</p>
              <div className="space-y-2 text-left">
                <p className="text-gray-400"><span className="text-red-400">Favorite Genre:</span> Death Metal</p>
                <p className="text-gray-400"><span className="text-red-400">Shows Attended:</span> 47</p>
                <p className="text-gray-400"><span className="text-red-400">Member Since:</span> 2024</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center">
            <h1 className="text-6xl font-bold mb-4">
              <span className="text-red-500">MOSH</span>
              <span className="text-white">UNION</span>
            </h1>
            <p className="text-white text-xl mb-8">Unite the Metal Community</p>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Welcome to MoshUnion - the ultimate platform for metal fans to connect, share memories, 
              collaborate, and celebrate the heavy music we love. Click on the navigation items above 
              to explore different sections!
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-900 p-6 rounded-lg border border-red-700 hover:border-red-500 transition">
                <h3 className="text-2xl font-bold text-red-400 mb-3">🎸 Memories</h3>
                <p className="text-gray-300">Share concert photos, reviews, and unforgettable moments from the pit</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg border border-red-700 hover:border-red-500 transition">
                <h3 className="text-2xl font-bold text-red-400 mb-3">🤝 Collab Wall</h3>
                <p className="text-gray-300">Connect with musicians and fans for collaborations and projects</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg border border-red-700 hover:border-red-500 transition">
                <h3 className="text-2xl font-bold text-red-400 mb-3">👤 Profile</h3>
                <p className="text-gray-300">Customize your profile and track your metal journey</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        onReturnHome={handleReturnHome}
      />
      <main className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        {renderContent()}
      </main>
    </div>
  );
}
