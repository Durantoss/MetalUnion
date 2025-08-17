import "./index.css";

// MetalHub - Mobile Working Version
function createMetalHubApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found!");
    return;
  }

  // Create the app structure directly with DOM manipulation
  rootElement.innerHTML = `
    <div style="background-color: #0a0a0a; color: #ffffff; min-height: 100vh; padding: 20px;">
      <header style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #dc2626; padding-bottom: 20px;">
        <h1 style="color: #dc2626; font-size: 3rem; margin: 0; text-shadow: 2px 2px 4px rgba(220, 38, 38, 0.3);">
          METALHUB
        </h1>
        <p style="color: #ccc; margin-top: 8px;">
          GAZE INTO THE ABYSS
        </p>
      </header>

      <main>
        <div id="loading" style="text-align: center; padding: 40px;">
          <h2 style="color: #dc2626; margin-bottom: 16px;">Loading metal bands...</h2>
        </div>
        
        <div id="content" style="display: none;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">Featured Bands</h2>
          <div id="bands-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;"></div>
        </div>
      </main>
    </div>
  `;

  // Load bands data
  fetch('/api/bands')
    .then(response => response.json())
    .then(bands => {
      const container = document.getElementById('bands-container');
      const loading = document.getElementById('loading');
      const content = document.getElementById('content');
      
      if (container && loading && content) {
        container.innerHTML = bands.map(band => `
          <div style="background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; color: #fff;">
            <h3 style="color: #dc2626; margin-bottom: 8px; font-size: 1.2rem; font-weight: bold;">
              ${band.name}
            </h3>
            <p style="color: #ccc; margin-bottom: 8px;">
              ${band.genre}
            </p>
            <p style="color: #999; font-size: 0.9rem; margin-bottom: 12px;">
              ${band.description}
            </p>
            <button 
              onclick="window.open('https://www.ticketmaster.com/search?q=${encodeURIComponent(band.name)}', '_blank')"
              style="background-color: #dc2626; color: white; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer; font-size: 0.875rem; font-weight: 600;"
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
      const loading = document.getElementById('loading');
      if (loading) {
        loading.innerHTML = `
          <h2 style="color: #dc2626;">Error loading bands</h2>
          <p>Please refresh the page</p>
        `;
      }
    });
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createMetalHubApp);
} else {
  createMetalHubApp();
}
