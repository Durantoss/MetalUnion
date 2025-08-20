import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { registerHealthRoutes, performanceMiddleware } from "./healthCheck";
import { registerEncryptionRoutes } from "./encryptionRoutes";
import { registerWebSocketExamples } from "./websocketExamples";
import fs from 'fs';
import path from 'path';

const app = express();

// Add security and CORS headers for mobile compatibility
app.use((req, res, next) => {
  // Allow credentials with specific origin
  const origin = req.headers.origin || 'http://localhost:5000';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  // Mobile-specific headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add performance monitoring middleware
app.use(performanceMiddleware);

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
    
    // Test storage connection before starting server (skip during deployment if DB is suspended)
    const isDeployment = process.env.NODE_ENV === "production" && process.env.REPL_SLUG;
    const isDatabaseSuspended = (error: any) => {
      return error?.message?.includes("endpoint has been disabled") || 
             error?.code === "XX000" ||
             error?.message?.includes("password authentication failed");
    };

    try {
      log("Testing storage connection...");
      // Import and test storage connectivity
      const { storage } = await import("./storage");
      await storage.getBands(); // Simple test to verify storage connectivity
      log("✅ Storage connection successful");
    } catch (error) {
      if (isDeployment && isDatabaseSuspended(error)) {
        log("⚠️ Database appears suspended during deployment - this is normal, it will wake up automatically");
        log("🚀 Continuing with server startup...");
      } else {
        log(`❌ Storage connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error("Storage error:", error);
        process.exit(1);
      }
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

    // Detect if running in external deployment environment
    const isExternalDeployment = process.env.REPL_SLUG && process.env.REPL_SLUG !== 'workspace';
    const useProduction = process.env.NODE_ENV === "production" || isExternalDeployment;
    
    log(`Deployment mode: ${useProduction ? 'production' : 'development'}`);
    log(`External deployment: ${isExternalDeployment ? 'yes' : 'no'}`);

    // Setup Vite or static serving with error handling
    try {
      if (!useProduction) {
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
        lastModified: true,
        index: false // Don't serve index.html from here
      }));
    }

    // Add comprehensive SPA fallback for external deployments
    app.get("*", (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      
      log(`SPA fallback serving content for: ${req.path}`);
      
      // Try to serve the appropriate index.html based on deployment mode
      let indexPath = null;
      const possibleIndexPaths = [
        path.resolve(import.meta.dirname, "public", "index.html"),
        path.resolve(import.meta.dirname, "..", "dist", "public", "index.html"),
        path.resolve(import.meta.dirname, "..", "client", "index.html")
      ];
      
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
        // Serve emergency static HTML that works in any environment
        log("Serving emergency static HTML interface");
        const emergencyPath = path.resolve(import.meta.dirname, "emergency.html");
        if (fs.existsSync(emergencyPath)) {
          res.sendFile(emergencyPath);
        } else {
          res.status(500).send('Application not available');
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
