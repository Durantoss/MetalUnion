// Mobile-optimized SecureDirectMessaging component - temporarily simplified to prevent hooks errors
interface SecureDirectMessagingProps {
  userId?: string;
}

export function SecureDirectMessaging({ userId = 'demo-user' }: SecureDirectMessagingProps) {
  // Demo conversations data
  const conversations = [
    {
      id: 'conv1',
      participantName: 'ConcertGoer',
      lastMessage: 'Hey, did you see Metallica last night?',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 'conv2',
      participantName: 'MetalQueen',
      lastMessage: 'Check out this new Iron Maiden track!',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 'conv3',
      participantName: 'RockVeteran',
      lastMessage: 'Thanks for the concert recommendation',
      lastMessageTime: '1 day ago',
      unreadCount: 1,
      isOnline: true
    }
  ];

  const messages = [
    {
      id: '1',
      senderId: 'user2',
      senderName: 'ConcertGoer',
      content: 'Hey! Did you catch the Metallica show last night?',
      timestamp: '10:25 PM',
      isOwn: false
    },
    {
      id: '2',
      senderId: userId,
      senderName: 'You',
      content: 'Yes! It was absolutely incredible! 🤘',
      timestamp: '10:27 PM',
      isOwn: true
    },
    {
      id: '3',
      senderId: 'user2',
      senderName: 'ConcertGoer',
      content: 'The guitar solo during Master of Puppets was insane!',
      timestamp: '10:30 PM',
      isOwn: false
    }
  ];

  return (
    <div className="h-full bg-black/20 rounded-lg border border-red-900/30 overflow-hidden">
      {/* Mobile-first layout */}
      <div className="flex flex-col h-full max-h-[70vh] md:max-h-[80vh]">
        {/* Header */}
        <div className="bg-black/40 border-b border-red-900/30 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Secure Messages</h3>
            <div className="flex items-center space-x-2 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400">End-to-End Encrypted</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List - Mobile Responsive */}
          <div className="w-full md:w-1/3 border-r border-red-900/30 bg-black/20">
            <div className="p-4 border-b border-red-900/30">
              <h4 className="text-white font-medium mb-3">Conversations</h4>
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-lg bg-black/40 border border-red-900/20 hover:border-red-700/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`h-3 w-3 rounded-full ${conv.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <span className="text-white font-medium text-sm">{conv.participantName}</span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs truncate">{conv.lastMessage}</p>
                    <p className="text-gray-500 text-xs mt-1">{conv.lastMessageTime}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message View - Hidden on small screens when not selected */}
          <div className="hidden md:flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-red-900/30 bg-black/30">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-white font-medium">ConcertGoer</span>
                <span className="text-gray-400 text-sm">• Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwn
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-75 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-red-900/30 bg-black/30">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your encrypted message..."
                  className="flex-1 bg-black/40 border border-red-900/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Message Notification */}
        <div className="md:hidden p-4 bg-black/30 border-t border-red-900/30">
          <p className="text-gray-400 text-center text-sm">
            Tap a conversation to view messages
          </p>
        </div>
      </div>
    </div>
  );
}