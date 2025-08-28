import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

import routes from './routes/index.js';
// import { setupVite, serveStatic, log } from './vite/index.js';
// import { registerHealthRoutes, performanceMiddleware } from './healthCheck/index.js';
// import { registerEncryptionRoutes } from './encryptionRoutes/index.js';

const app = express();

// Parse JSON bodies
app.use(express.json());

// Example: simple mobile health check
app.get('/api/mobile-health', (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mobile: isMobile,
    userAgent,
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      connection: req.headers.connection
    },
    demoMode: true
  });
});

// Mount main routes
app.use('/api', routes);

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});