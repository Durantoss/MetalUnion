import express from 'express';
import { registerRoutes } from '../server/routes.js';
import { setupAuth } from '../server/auth.js';

// Create Express app for serverless function
const app = express();

// Add CORS middleware for Vercel
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, User-Agent');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize the app with routes
let initialized = false;

async function initializeApp() {
  if (initialized) return;
  
  try {
    console.log('Initializing serverless function...');
    
    // Setup authentication
    await setupAuth(app);
    
    // Register all routes
    await registerRoutes(app);
    
    initialized = true;
    console.log('Serverless function initialized successfully');
  } catch (error) {
    console.error('Failed to initialize serverless function:', error);
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Initialize app on first request
    await initializeApp();
    
    // Handle the request with Express
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
