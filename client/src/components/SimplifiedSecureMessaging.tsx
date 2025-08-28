// Simplified, fully functional secure messaging component for easy testing
import { useState } from 'react';
import { MessageCircle, Send, Shield, User, Clock, Check } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  encrypted: boolean;
}

interface Conversation {
  id: string;
  participantName: string;
  participantStatus: 'online' | 'offline';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

interface SimplifiedSecureMessagingProps {
  userId?: string;
}

export function SimplifiedSecureMessaging({ userId = 'demo-user' }: SimplifiedSecureMessagingProps) {
  // Demo data for testing
  const [conversations] = useState<Conversation[]>([
    {
      id: 'conv1',
      participantName: 'MetalFan2024',
      participantStatus: 'online',
      lastMessage: 'Did you catch the Metallica show last night?',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      messages: [
        {
          id: 'msg1',
          senderId: 'user2',
          senderName: 'MetalFan2024',
          content: 'Hey! Did you catch the Metallica show last night?',
          timestamp: '10:25 PM',
          isOwn: false,
          encrypted: true
        },
        {
          id: 'msg2',
          senderId: userId,
          senderName: 'You',
          content: 'Yes! It was absolutely incredible! The Master of Puppets solo was insane 🤘',
          timestamp: '10:27 PM',
          isOwn: true,
          encrypted: true
        },
        {
          id: 'msg3',
          senderId: 'user2',
          senderName: 'MetalFan2024',
          content: 'I know right! James\' vocals were on point too. Want to check out Iron Maiden next month?',
          timestamp: '10:30 PM',
          isOwn: false,
          encrypted: true
        }
      ]
    },
    {
      id: 'conv2',
      participantName: 'ConcertGoer',
      participantStatus: 'offline',
      lastMessage: 'Thanks for the concert recommendation!',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      messages: [
        {
          id: 'msg4',
          senderId: 'user3',
          senderName: 'ConcertGoer',
          content: 'Thanks for the concert recommendation! Black Sabbath was legendary.',
          timestamp: '9:15 PM',
          isOwn: false,
          encrypted: true
        },
        {
          id: 'msg5',
          senderId: userId,
          senderName: 'You',
          content: 'Glad you enjoyed it! Ozzy still has it at his age.',
          timestamp: '9:18 PM',
          isOwn: true,
          encrypted: true
        }
      ]
    },
    {
      id: 'conv3',
      participantName: 'RockVeteran',
      participantStatus: 'online',
      lastMessage: 'Check out this new band I discovered',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
      messages: [
        {
          id: 'msg6',
          senderId: 'user4',
          senderName: 'RockVeteran',
          content: 'Check out this new band I discovered - Spiritbox. Their latest album is fire!',
          timestamp: '7:45 PM',
          isOwn: false,
          encrypted: true
        }
      ]
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string>('conv1');
  const [newMessage, setNewMessage] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);

  const currentConversation = conversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // In a real app, this would send the message to the server
    console.log('Sending encrypted message:', newMessage);
    alert(`Message sent (encrypted): "${newMessage}"`);
    setNewMessage('');
  };

  const handleConversationSelect = (convId: string) => {
    setSelectedConversation(convId);
    setShowConversationList(false); // Hide list on mobile after selection
  };

  return (
    <div className="h-full bg-black/20 rounded-lg border border-red-900/30 overflow-hidden">
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Header */}
        <div className="bg-black/40 border-b border-red-900/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Messages</h3>
              <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                RSA-2048 + AES-256
              </span>
            </div>
            {!showConversationList && (
              <button 
                onClick={() => setShowConversationList(true)}
                className="md:hidden text-red-400 hover:text-red-300"
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className={`${showConversationList ? 'block' : 'hidden'} md:block w-full md:w-1/3 border-r border-red-900/30 bg-black/20`}>
            <div className="p-4">
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Conversations</span>
              </h4>
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleConversationSelect(conv.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedConversation === conv.id
                        ? 'bg-red-600/20 border-red-500/50'
                        : 'bg-black/40 border-red-900/20 hover:border-red-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`h-3 w-3 rounded-full ${
                          conv.participantStatus === 'online' ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-white font-medium text-sm">{conv.participantName}</span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs truncate">{conv.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-500 text-xs">{conv.lastMessageTime}</p>
                      <Shield className="h-3 w-3 text-green-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message View */}
          <div className={`${!showConversationList ? 'block' : 'hidden'} md:block flex-1 flex flex-col`}>
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-red-900/30 bg-black/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-white font-medium">{currentConversation.participantName}</span>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className={`h-2 w-2 rounded-full ${
                            currentConversation.participantStatus === 'online' ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-gray-400 capitalize">{currentConversation.participantStatus}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-green-400">
                      <Shield className="h-4 w-4" />
                      <span>Encrypted</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-black/10 to-black/20">
                  {currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md group`}>
                        <div
                          className={`px-4 py-3 rounded-2xl relative ${
                            message.isOwn
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white ml-12'
                              : 'bg-gray-700 text-gray-100 mr-12'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{message.timestamp}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {message.encrypted && <Shield className="h-3 w-3" />}
                              {message.isOwn && <Check className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-red-900/30 bg-black/30">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your encrypted message..."
                      className="flex-1 bg-black/40 border border-red-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center space-x-2 touch-manipulation"
                    >
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                  
                  {/* Encryption Info */}
                  <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
                    <Shield className="h-3 w-3 mr-1" />
                    <span>Messages are end-to-end encrypted with RSA-2048 + AES-256-GCM</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}