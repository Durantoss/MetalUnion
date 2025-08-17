// Direct implementation without any external dependencies
console.log('Loading MetalHub...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
} else {
  // Clear any existing content
  rootElement.innerHTML = '';
  
  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background-color: #0a0a0a; 
      color: #ffffff; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
    }
    .container { 
      padding: 20px; 
      max-width: 1200px; 
      margin: 0 auto; 
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px; 
      border-bottom: 2px solid #dc2626; 
      padding-bottom: 20px; 
    }
    .title { 
      color: #dc2626; 
      font-size: clamp(2rem, 8vw, 4rem); 
      font-weight: 900;
      text-shadow: 2px 2px 4px rgba(220, 38, 38, 0.3);
      margin-bottom: 8px;
      letter-spacing: 2px;
    }
    .subtitle { 
      color: #ccc; 
      font-size: clamp(0.9rem, 3vw, 1.1rem);
      font-weight: 500;
    }
    .loading { 
      text-align: center; 
      padding: 60px 20px; 
    }
    .bands-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
      gap: 20px; 
      margin-top: 20px; 
    }
    .band-card { 
      background: linear-gradient(145deg, #1a1a1a, #151515);
      border: 1px solid #333; 
      border-radius: 12px; 
      padding: 24px; 
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
      overflow: hidden;
    }
    .band-card:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.1);
      border-color: #dc2626;
    }
    .band-name { 
      color: #dc2626; 
      font-size: 1.3rem; 
      font-weight: bold; 
      margin-bottom: 8px; 
    }
    .band-genre { 
      color: #888; 
      font-size: 0.9rem;
      margin-bottom: 12px; 
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .band-description { 
      color: #ccc; 
      font-size: 0.85rem; 
      line-height: 1.5;
      margin-bottom: 16px; 
    }
    .ticket-btn { 
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white; 
      border: none; 
      border-radius: 8px; 
      padding: 10px 20px; 
      cursor: pointer; 
      font-size: 0.85rem; 
      font-weight: 600;
      transition: all 0.2s;
      width: 100%;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ticket-btn:hover { 
      background: linear-gradient(135deg, #b91c1c, #991b1b);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }
    .ticket-btn:active { 
      transform: translateY(0);
    }
    @media (max-width: 768px) {
      .container { padding: 16px; }
      .bands-grid { grid-template-columns: 1fr; gap: 16px; }
      .band-card { padding: 20px; }
    }
  `;
  document.head.appendChild(style);

  // Create main container
  const container = document.createElement('div');
  container.className = 'container';
  
  // Create header
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <h1 class="title">METALHUB</h1>
    <p class="subtitle">GAZE INTO THE ABYSS</p>
  `;
  
  // Create loading element
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.innerHTML = `
    <h2 style="color: #dc2626; margin-bottom: 16px;">Loading metal bands...</h2>
    <div style="animation: pulse 2s infinite;">🤘</div>
  `;
  
  // Create content container
  const content = document.createElement('div');
  content.style.display = 'none';
  content.innerHTML = `
    <h2 style="color: #dc2626; margin-bottom: 20px; font-size: 1.5rem;">Featured Bands</h2>
    <div class="bands-grid" id="bands-container"></div>
  `;
  
  // Assemble the page
  container.appendChild(header);
  container.appendChild(loading);
  container.appendChild(content);
  rootElement.appendChild(container);
  
  // Load bands data
  console.log('Fetching bands...');
  fetch('/api/bands')
    .then(response => {
      console.log('Response received:', response.status);
      return response.json();
    })
    .then(bands => {
      console.log('Bands loaded:', bands.length);
      const bandsContainer = document.getElementById('bands-container');
      
      if (bandsContainer) {
        bandsContainer.innerHTML = bands.map(band => `
          <div class="band-card">
            <h3 class="band-name">${band.name}</h3>
            <p class="band-genre">${band.genre}</p>
            <p class="band-description">${band.description}</p>
            <button 
              class="ticket-btn" 
              onclick="window.open('https://www.ticketmaster.com/search?q=${encodeURIComponent(band.name)}', '_blank')"
              data-testid="button-tickets-${band.name.toLowerCase().replace(/\s+/g, '-')}"
            >
              🎫 GET TICKETS
            </button>
          </div>
        `).join('');
        
        loading.style.display = 'none';
        content.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error loading bands:', error);
      loading.innerHTML = `
        <h2 style="color: #dc2626;">Error loading bands</h2>
        <p style="color: #ccc;">Please refresh the page</p>
        <details style="margin-top: 16px; color: #666;">
          <summary>Error details</summary>
          <pre>${error.message}</pre>
        </details>
      `;
    });
}
