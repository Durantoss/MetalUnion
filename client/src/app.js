// MoshUnion - Pure JavaScript Implementation
console.log('🤘 MoshUnion Loading...');

// Clear any existing content
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
} else {
  rootElement.innerHTML = '';
  
  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      background-color: #0a0a0a; 
      color: #ffffff; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      line-height: 1.6;
    }
    
    .app-container { 
      padding: 20px; 
      max-width: 1200px; 
      margin: 0 auto; 
    }
    
    .header { 
      text-align: center; 
      margin-bottom: 40px; 
      border-bottom: 3px solid #dc2626; 
      padding-bottom: 20px; 
    }
    
    .main-title { 
      color: #dc2626; 
      font-size: clamp(2.5rem, 8vw, 5rem); 
      font-weight: 900;
      text-shadow: 3px 3px 6px rgba(220, 38, 38, 0.4);
      margin-bottom: 8px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    
    .subtitle { 
      color: #ccc; 
      font-size: clamp(1rem, 3vw, 1.2rem);
      font-weight: 500;
      letter-spacing: 1px;
    }
    
    .loading-section { 
      text-align: center; 
      padding: 80px 20px; 
    }
    
    .loading-title {
      color: #dc2626;
      font-size: 1.8rem;
      margin-bottom: 20px;
      font-weight: bold;
    }
    
    .loading-icon {
      font-size: 2rem;
      animation: bounce 1s infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .bands-section h2 {
      color: #dc2626; 
      margin-bottom: 30px; 
      font-size: 2rem;
      font-weight: bold;
    }
    
    .bands-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
      gap: 24px; 
      margin-top: 20px; 
    }
    
    .band-card { 
      background: linear-gradient(145deg, #1f1f1f, #151515);
      border: 2px solid #333; 
      border-radius: 16px; 
      padding: 28px; 
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .band-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #dc2626, #b91c1c);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .band-card:hover::before {
      transform: scaleX(1);
    }
    
    .band-card:hover { 
      transform: translateY(-4px); 
      box-shadow: 0 12px 30px rgba(220, 38, 38, 0.15);
      border-color: #dc2626;
    }
    
    .band-name { 
      color: #dc2626; 
      font-size: 1.4rem; 
      font-weight: bold; 
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .band-genre { 
      color: #888; 
      font-size: 0.9rem;
      margin-bottom: 15px; 
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    
    .band-description { 
      color: #ccc; 
      font-size: 0.9rem; 
      line-height: 1.6;
      margin-bottom: 20px; 
    }
    
    .ticket-button { 
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white; 
      border: none; 
      border-radius: 10px; 
      padding: 12px 24px; 
      cursor: pointer; 
      font-size: 0.9rem; 
      font-weight: 700;
      transition: all 0.3s ease;
      width: 100%;
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative;
      overflow: hidden;
    }
    
    .ticket-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }
    
    .ticket-button:hover::before {
      left: 100%;
    }
    
    .ticket-button:hover { 
      background: linear-gradient(135deg, #b91c1c, #991b1b);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
    }
    
    .ticket-button:active { 
      transform: translateY(0);
    }
    
    .error-section {
      text-align: center;
      padding: 60px 20px;
      color: #dc2626;
    }
    
    @media (max-width: 768px) {
      .app-container { 
        padding: 16px; 
      }
      .bands-grid { 
        grid-template-columns: 1fr; 
        gap: 20px; 
      }
      .band-card { 
        padding: 24px; 
      }
      .main-title {
        font-size: 2.5rem;
      }
    }
  `;
  document.head.appendChild(style);

  // Create app structure
  const appContainer = document.createElement('div');
  appContainer.className = 'app-container';
  
  // Header
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <h1 class="main-title">MoshUnion</h1>
    <p class="subtitle">GAZE INTO THE ABYSS</p>
  `;
  
  // Loading section
  const loadingSection = document.createElement('div');
  loadingSection.className = 'loading-section';
  loadingSection.innerHTML = `
    <h2 class="loading-title">Loading Metal Bands...</h2>
    <div class="loading-icon">🤘</div>
  `;
  
  // Content section (hidden initially)
  const contentSection = document.createElement('div');
  contentSection.className = 'bands-section';
  contentSection.style.display = 'none';
  contentSection.innerHTML = `
    <h2>Featured Bands</h2>
    <div class="bands-grid" id="bands-grid"></div>
  `;
  
  // Assemble the app
  appContainer.appendChild(header);
  appContainer.appendChild(loadingSection);
  appContainer.appendChild(contentSection);
  rootElement.appendChild(appContainer);
  
  // Load bands data
  console.log('🎸 Fetching bands data...');
  
  fetch('/api/bands')
    .then(response => {
      console.log('📡 API Response:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(bands => {
      console.log(`🎵 Loaded ${bands.length} bands`);
      
      const bandsGrid = document.getElementById('bands-grid');
      
      if (bandsGrid && bands.length > 0) {
        // Clear existing content
        bandsGrid.innerHTML = '';
        
        bands.forEach(band => {
          // Create band card container
          const bandCard = document.createElement('div');
          bandCard.className = 'band-card';
          
          // Create and set band name
          const bandName = document.createElement('h3');
          bandName.className = 'band-name';
          bandName.textContent = band.name;
          
          // Create and set band genre
          const bandGenre = document.createElement('p');
          bandGenre.className = 'band-genre';
          bandGenre.textContent = band.genre;
          
          // Create and set band description
          const bandDescription = document.createElement('p');
          bandDescription.className = 'band-description';
          bandDescription.textContent = band.description;
          
          // Create ticket button with safe event handling
          const ticketButton = document.createElement('button');
          ticketButton.className = 'ticket-button';
          ticketButton.textContent = '🎫 Get Tickets';
          // Safe data-testid generation
          const safeTestId = `button-tickets-${band.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
          ticketButton.setAttribute('data-testid', safeTestId);
          
          // Add safe event listener instead of onclick
          ticketButton.addEventListener('click', () => {
            openTicketSearch(band.name);
          });
          
          // Assemble the card
          bandCard.appendChild(bandName);
          bandCard.appendChild(bandGenre);
          bandCard.appendChild(bandDescription);
          bandCard.appendChild(ticketButton);
          
          // Add to grid
          bandsGrid.appendChild(bandCard);
        });
        
        // Hide loading, show content
        loadingSection.style.display = 'none';
        contentSection.style.display = 'block';
        
        console.log('✅ MoshUnion loaded successfully!');
      } else {
        throw new Error('No bands data received');
      }
    })
    .catch(error => {
      console.error('❌ Error loading bands:', error);
      
      loadingSection.innerHTML = `
        <div class="error-section">
          <h2>Error Loading Bands</h2>
          <p>Please refresh the page to try again</p>
          <details style="margin-top: 16px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
            <summary>Technical Details</summary>
            <pre style="background: #1a1a1a; padding: 12px; border-radius: 6px; overflow-x: auto;">${error.message}</pre>
          </details>
        </div>
      `;
    });
}

// Helper functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function openTicketSearch(bandName) {
  const url = `https://www.ticketmaster.com/search?q=${encodeURIComponent(bandName)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  console.log(`🎫 Opening tickets for: ${bandName}`);
}

console.log('🚀 MoshUnion JavaScript loaded');