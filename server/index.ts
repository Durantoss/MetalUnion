import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

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
      log(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Log environment
    log(`Environment: ${app.get("env") || "development"}`);
    log(`Node environment: ${process.env.NODE_ENV || "not set"}`);
    
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

    // Server listening with comprehensive error handling
    const port = parseInt(process.env.PORT || '5000', 10);
    
    if (isNaN(port) || port < 1 || port > 65535) {
      log(`Invalid port: ${process.env.PORT}. Using default port 5000.`);
      process.exit(1);
    }

    log(`Attempting to start server on port ${port}...`);

    // Wrap server.listen in Promise for better error handling
    const startServer = new Promise<void>((resolve, reject) => {
      const serverInstance = server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, (error?: Error) => {
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
      await startServer;
      log(`✅ MoshUnion server successfully started on port ${port}`);
      log(`🔗 Server accessible at http://0.0.0.0:${port}`);
      log("🎸 Ready to serve metal community requests!");
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
