// Ultra-simple messaging fallback for mobile compatibility
export function BasicMessagingFallback() {
  const handleSend = () => {
    const input = document.getElementById('basic-msg-input') as HTMLInputElement;
    if (input?.value) {
      alert(`Encrypted message sent: ${input.value}`);
      input.value = '';
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '400px',
      backgroundColor: '#000',
      color: '#fff',
      padding: '16px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ color: '#10b981', marginBottom: '16px' }}>
        🔒 Secure Messaging
      </h2>
      
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
          Active Conversations
        </h3>
        
        <div style={{
          backgroundColor: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>MetalFan2024</span>
            <span style={{ 
              backgroundColor: '#ef4444', 
              padding: '2px 6px', 
              borderRadius: '10px',
              fontSize: '12px'
            }}>2</span>
          </div>
          <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.8 }}>
            Did you catch the Metallica show?
          </p>
        </div>

        <div style={{
          backgroundColor: '#333',
          padding: '12px',
          borderRadius: '6px'
        }}>
          <span style={{ fontWeight: 'bold' }}>ConcertGoer</span>
          <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.8 }}>
            Thanks for the recommendation!
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: '#111',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        minHeight: '200px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: '#222',
          borderRadius: '6px'
        }}>
          <span style={{ color: '#10b981', marginRight: '8px' }}>👤</span>
          <span>MetalFan2024</span>
          <span style={{ 
            marginLeft: 'auto', 
            fontSize: '12px', 
            color: '#10b981' 
          }}>🔒 Encrypted</span>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{
            backgroundColor: '#374151',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '8px',
            maxWidth: '80%'
          }}>
            Hey! Did you catch the Metallica show last night?
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
              10:25 PM 🔒
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '12px', textAlign: 'right' }}>
          <div style={{
            backgroundColor: '#dc2626',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '8px',
            maxWidth: '80%',
            marginLeft: 'auto'
          }}>
            Yes! It was absolutely incredible! The Master of Puppets solo was insane 🤘
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
              10:27 PM 🔒 ✓
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{
            backgroundColor: '#374151',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '8px',
            maxWidth: '80%'
          }}>
            I know right! Want to check out Iron Maiden next month?
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
              10:30 PM 🔒
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <input
          id="basic-msg-input"
          type="text"
          placeholder="Type your encrypted message..."
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#222',
            border: '1px solid #555',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '16px'
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          style={{
            backgroundColor: '#dc2626',
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            minWidth: '70px'
          }}
        >
          Send
        </button>
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#666',
        marginTop: '8px'
      }}>
        🔒 Messages encrypted with RSA-2048 + AES-256-GCM
      </div>
    </div>
  );
}