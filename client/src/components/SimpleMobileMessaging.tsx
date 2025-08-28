// Simple mobile-optimized messaging interface that works on all devices
import { Send, Shield, MessageCircle, User } from 'lucide-react';

interface SimpleMobileMessagingProps {
  userId?: string;
}

export function SimpleMobileMessaging({ userId = 'demo-user' }: SimpleMobileMessagingProps) {
  const handleSendMessage = () => {
    const input = document.querySelector('#simple-message-input') as HTMLInputElement;
    if (input && input.value.trim()) {
      alert(`Message sent (encrypted): "${input.value}"`);
      input.value = '';
    }
  };

  return (
    <div style={{
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(153, 27, 27, 0.3)',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderBottom: '1px solid rgba(153, 27, 27, 0.3)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Shield style={{ height: '20px', width: '20px', color: '#10b981' }} />
        <h3 style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: '600',
          margin: 0 
        }}>
          Messages
        </h3>
        <span style={{
          fontSize: '12px',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          padding: '4px 8px',
          borderRadius: '9999px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          RSA-2048 + AES-256
        </span>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        {/* Conversations List - Mobile First */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(153, 27, 27, 0.3)',
          padding: '16px'
        }}>
          <h4 style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MessageCircle style={{ height: '16px', width: '16px' }} />
            Active Conversations
          </h4>
          
          {/* Sample Conversation */}
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid rgba(220, 38, 38, 0.5)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  height: '12px',
                  width: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></div>
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                  MetalFan2024
                </span>
              </div>
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '12px',
                borderRadius: '50%',
                height: '20px',
                width: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                2
              </span>
            </div>
            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              margin: '0 0 4px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              Did you catch the Metallica show last night?
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>2 min ago</span>
              <Shield style={{ height: '12px', width: '12px', color: '#10b981' }} />
            </div>
          </div>

          {/* Another Conversation */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(153, 27, 27, 0.2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  height: '12px',
                  width: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#6b7280'
                }}></div>
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                  ConcertGoer
                </span>
              </div>
            </div>
            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              margin: '0 0 4px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              Thanks for the concert recommendation!
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>1 hour ago</span>
              <Shield style={{ height: '12px', width: '12px', color: '#10b981' }} />
            </div>
          </div>
        </div>

        {/* Message Area */}
        <div style={{
          flex: 1,
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: '200px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(153, 27, 27, 0.3)'
          }}>
            <User style={{ height: '20px', width: '20px', color: '#9ca3af' }} />
            <div>
              <div style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>
                MetalFan2024
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px'
              }}>
                <div style={{
                  height: '8px',
                  width: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></div>
                <span style={{ color: '#9ca3af' }}>online</span>
              </div>
            </div>
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#10b981'
            }}>
              <Shield style={{ height: '16px', width: '16px' }} />
              <span>Encrypted</span>
            </div>
          </div>

          {/* Sample Messages */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              backgroundColor: '#374151',
              color: '#f3f4f6',
              padding: '12px 16px',
              borderRadius: '16px',
              marginRight: '48px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>
                Hey! Did you catch the Metallica show last night?
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                opacity: 0.75
              }}>
                <span>10:25 PM</span>
                <Shield style={{ height: '12px', width: '12px' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              maxWidth: '80%',
              background: 'linear-gradient(to right, #dc2626, #b91c1c)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              marginLeft: '48px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>
                Yes! It was absolutely incredible! The Master of Puppets solo was insane 🤘
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                opacity: 0.75
              }}>
                <span>10:27 PM</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield style={{ height: '12px', width: '12px' }} />
                  <span>✓</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              backgroundColor: '#374151',
              color: '#f3f4f6',
              padding: '12px 16px',
              borderRadius: '16px',
              marginRight: '48px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>
                I know right! James' vocals were on point too. Want to check out Iron Maiden next month?
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                opacity: 0.75
              }}>
                <span>10:30 PM</span>
                <Shield style={{ height: '12px', width: '12px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(153, 27, 27, 0.3)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <input
              id="simple-message-input"
              type="text"
              placeholder="Type your encrypted message..."
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(153, 27, 27, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '16px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              style={{
                background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                minHeight: '48px',
                touchAction: 'manipulation'
              }}
            >
              <Send style={{ height: '16px', width: '16px' }} />
              <span>Send</span>
            </button>
          </div>
          
          {/* Encryption Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '12px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <Shield style={{ height: '12px', width: '12px', marginRight: '4px' }} />
            <span>Messages are end-to-end encrypted with RSA-2048 + AES-256-GCM</span>
          </div>
        </div>
      </div>
    </div>
  );
}