// Dedicated test page for secure messaging functionality
import { useState } from 'react';
import { SimplifiedSecureMessaging } from './SimplifiedSecureMessaging';
import { Shield, MessageCircle, TestTube, Users, Key, Lock, CheckCircle } from 'lucide-react';

export function MessagingTestPage() {
  const [selectedTest, setSelectedTest] = useState<'basic' | 'advanced' | 'encryption'>('basic');
  const [testUserId, setTestUserId] = useState('demo-user');

  const testScenarios = {
    basic: {
      title: 'Basic Messaging Test',
      description: 'Test the core messaging interface with demo conversations',
      icon: MessageCircle,
      color: 'blue'
    },
    advanced: {
      title: 'Advanced Features Test',
      description: 'Test advanced messaging features like status, typing indicators, etc.',
      icon: Users,
      color: 'purple'
    },
    encryption: {
      title: 'Encryption Demo',
      description: 'See how end-to-end encryption works in the messaging system',
      icon: Shield,
      color: 'green'
    }
  };

  const encryptionSteps = [
    {
      step: 1,
      title: 'Key Generation',
      description: 'RSA-2048 key pairs are generated for each user',
      icon: Key,
      status: 'completed'
    },
    {
      step: 2,
      title: 'Message Encryption',
      description: 'Messages are encrypted with AES-256-GCM before sending',
      icon: Lock,
      status: 'completed'
    },
    {
      step: 3,
      title: 'Secure Transmission',
      description: 'Encrypted messages are transmitted over secure channels',
      icon: Shield,
      status: 'completed'
    },
    {
      step: 4,
      title: 'Decryption',
      description: 'Recipients decrypt messages with their private keys',
      icon: CheckCircle,
      status: 'completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            🔒 Secure Messaging Test Lab
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Test and explore the secure messaging functionality with different scenarios and encryption demonstrations.
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-black/40 border border-red-900/30 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-red-400" />
            <span>Test Controls</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(testScenarios).map(([key, scenario]) => {
              const Icon = scenario.icon;
              const isSelected = selectedTest === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTest(key as any)}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-red-500 bg-red-600/20'
                      : 'border-red-900/30 bg-black/20 hover:border-red-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-red-400' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {scenario.title}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{scenario.description}</p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-white font-medium">Test User ID:</label>
            <input
              type="text"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              className="bg-black/40 border border-red-900/30 rounded px-3 py-1 text-white focus:outline-none focus:border-red-500"
              placeholder="Enter user ID for testing"
            />
            <button
              onClick={() => setTestUserId(`user-${Date.now()}`)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
            >
              Generate Random
            </button>
          </div>
        </div>

        {/* Encryption Demo (when selected) */}
        {selectedTest === 'encryption' && (
          <div className="bg-black/40 border border-green-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>End-to-End Encryption Process</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {encryptionSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="bg-black/30 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="bg-green-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <Icon className="h-4 w-4 text-green-400" />
                    </div>
                    <h3 className="text-white font-medium mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-semibold">Security Features</span>
              </div>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• RSA-2048 public-key cryptography for key exchange</li>
                <li>• AES-256-GCM for symmetric encryption of messages</li>
                <li>• Perfect Forward Secrecy with ephemeral keys</li>
                <li>• Message authentication and integrity verification</li>
                <li>• No server-side message storage in plaintext</li>
              </ul>
            </div>
          </div>
        )}

        {/* Testing Instructions */}
        <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-yellow-400" />
            <span>How to Test</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-medium mb-3">Testing the Interface:</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Click on different conversations to see the message history</li>
                <li>• Type messages in the input field and click "Send"</li>
                <li>• Test on mobile by resizing your browser window</li>
                <li>• Check the responsive layout and touch targets</li>
                <li>• Observe the encryption indicators and status messages</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-3">Key Features to Test:</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Real-time message sending simulation</li>
                <li>• Online/offline status indicators</li>
                <li>• Unread message badges</li>
                <li>• Mobile-responsive conversation switching</li>
                <li>• Encryption status display</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Messaging Interface */}
        <div className="bg-black/40 border border-red-900/30 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-red-900/30 bg-black/30">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-red-400" />
              <span>Live Messaging Interface</span>
              <span className="text-sm bg-red-600/20 text-red-400 px-2 py-1 rounded">
                Testing as: {testUserId}
              </span>
            </h2>
          </div>
          
          {/* Messaging Component */}
          <div className="h-[600px]">
            <SimplifiedSecureMessaging userId={testUserId} />
          </div>
        </div>

        {/* Development Notes */}
        <div className="mt-8 bg-black/40 border border-blue-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-400" />
            <span>Development Notes</span>
          </h2>
          
          <div className="text-gray-300 space-y-3 text-sm">
            <p>
              <strong>Current Implementation:</strong> This is a fully functional demo with static data. 
              The messaging interface is complete and ready for backend integration.
            </p>
            <p>
              <strong>Next Steps:</strong> To make this fully functional, you would need to:
            </p>
            <ul className="ml-4 space-y-1">
              <li>• Connect to a WebSocket server for real-time messaging</li>
              <li>• Implement actual RSA/AES encryption on the client side</li>
              <li>• Add user authentication and conversation management</li>
              <li>• Store conversation history in a database</li>
              <li>• Add file sharing and media message capabilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}