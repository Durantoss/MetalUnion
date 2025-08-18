import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Comprehensive server startup with error handling
(async () => {
  try {
    // Log startup process
    log("Starting MoshUnion server...");
    
    // Check required environment variables
    const requiredEnvVars = ['DATABASE_URL'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      log(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
      console.error(`Critical: Missing environment variables: ${missingEnvVars.join(', ')}`);
      process.exit(1);
    }

    // Log environment validation success
    log(`✅ All required environment variables present`);
    
    // Additional deployment environment validation
    log(`Port configuration: ${process.env.PORT || '5000'}`);
    log(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
    log(`Working directory: ${process.cwd()}`);
    log(`Platform: ${process.platform} ${process.arch}`);

    // Log environment
    log(`Environment: ${app.get("env") || "development"}`);
    log(`Node environment: ${process.env.NODE_ENV || "not set"}`);
    
    // Test database connection before starting server
    try {
      log("Testing database connection...");
      // Import and test database connectivity
      const { storage } = await import("./storage");
      await storage.getBands(); // Simple test to verify database connectivity
      log("✅ Database connection successful");
    } catch (error) {
      log(`❌ Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Database error:", error);
      process.exit(1);
    }

    // Register routes with error handling
    let server;
    try {
      log("Registering server routes...");
      server = await registerRoutes(app);
      log("Routes registered successfully");
    } catch (error) {
      log(`Failed to register routes: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Route registration error:", error);
      process.exit(1);
    }



    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error ${status}: ${message}`);
      res.status(status).json({ message });
      
      // Don't throw in production to prevent server crash
      if (app.get("env") === "development") {
        console.error("Development error:", err);
      }
    });

    // Setup Vite or static serving with error handling
    try {
      if (app.get("env") === "development") {
        log("Setting up Vite development server...");
        await setupVite(app, server);
        log("Vite development server configured");
      } else {
        log("Setting up static file serving for production...");
        serveStatic(app);
        log("Static file serving configured");
      }
    } catch (error) {
      log(`Failed to setup frontend serving: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Frontend setup error:", error);
      process.exit(1);
    }

    // Add production static assets serving for external deployments
    const productionAssetsPath = path.resolve(import.meta.dirname, "public");
    if (fs.existsSync(productionAssetsPath)) {
      log(`Serving production assets from: ${productionAssetsPath}`);
      app.use(express.static(productionAssetsPath, {
        maxAge: '1d',
        etag: true,
        lastModified: true
      }));
    }

    // Add emergency SPA fallback for external deployments
    app.get("*", (req, res) => {
      // Only serve index.html for non-API routes
      if (!req.path.startsWith('/api/')) {
        log(`SPA fallback serving index.html for: ${req.path}`);
        
        // Try multiple possible locations for index.html
        const possibleIndexPaths = [
          path.resolve(import.meta.dirname, "..", "dist", "public", "index.html"),
          path.resolve(import.meta.dirname, "..", "client", "index.html"),
          path.resolve(import.meta.dirname, "public", "index.html")
        ];
        
        let indexPath = null;
        for (const possiblePath of possibleIndexPaths) {
          if (fs.existsSync(possiblePath)) {
            indexPath = possiblePath;
            log(`Found index.html at: ${indexPath}`);
            break;
          }
        }
        
        if (indexPath) {
          res.sendFile(indexPath);
        } else {
          log("Index.html not found in any location, serving emergency response");
          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>MoshUnion</title>
              <style>
                body { 
                  background: #0a0a0a; 
                  color: #fff; 
                  font-family: Arial; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  min-height: 100vh; 
                  margin: 0; 
                }
                .container { text-align: center; }
                h1 { color: #dc2626; font-size: 3rem; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🤘 MOSHUNION 🤘</h1>
                <p>Loading metal community platform...</p>
                <script>
                  setTimeout(() => window.location.reload(), 2000);
                </script>
              </div>
            </body>
            </html>
          `);
        }
      }
    });

    // Server listening with comprehensive error handling
    const port = parseInt(process.env.PORT || '5000', 10);
    
    if (isNaN(port) || port < 1 || port > 65535) {
      log(`Invalid port: ${process.env.PORT}. Using default port 5000.`);
      process.exit(1);
    }

    log(`Attempting to start server on port ${port}...`);

    // Wrap server.listen in Promise for better error handling
    const startServer = new Promise<void>((resolve, reject) => {
      const serverInstance = server.listen(port, "0.0.0.0", (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });

      // Handle server errors
      serverInstance.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${port} is already in use`));
        } else if (error.code === 'EACCES') {
          reject(new Error(`Permission denied to use port ${port}`));
        } else {
          reject(error);
        }
      });
    });

    try {
      // Add timeout to server startup
      const startupTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Server startup timeout after 30 seconds')), 30000);
      });
      
      await Promise.race([startServer, startupTimeout]);
      log(`✅ MoshUnion server successfully started on port ${port}`);
      log(`🔗 Server accessible at http://0.0.0.0:${port}`);
      log(`🔗 Health check available at http://0.0.0.0:${port}/health`);
      log("🎸 Ready to serve metal community requests!");
      
      // Log successful startup to console for deployment monitoring
      console.log(`SERVER_STARTED: Port ${port}, PID ${process.pid}, Environment ${app.get("env")}`);
      
      // Start heartbeat logging for deployment monitoring (only in production)
      if (process.env.NODE_ENV === 'production') {
        setInterval(() => {
          log(`🔄 Server heartbeat - uptime: ${Math.floor(process.uptime())}s, memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        }, 300000); // Log every 5 minutes in production
      }
      
    } catch (error) {
      log(`❌ Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Server startup error:", error);
      process.exit(1);
    }

  } catch (globalError) {
    log(`❌ Critical server initialization error: ${globalError instanceof Error ? globalError.message : 'Unknown error'}`);
    console.error("Global initialization error:", globalError);
    process.exit(1);
  }
})().catch((uncaughtError) => {
  log(`❌ Uncaught server error: ${uncaughtError instanceof Error ? uncaughtError.message : 'Unknown error'}`);
  console.error("Uncaught error:", uncaughtError);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  log(`❌ Uncaught Exception: ${error.message}`);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled Rejection at Promise: ${promise}, reason: ${reason}`);
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
