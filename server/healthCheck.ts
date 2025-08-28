import type { Express, Request, Response } from "express";
import { storage } from "./storage";

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: boolean;
    storage: boolean;
    memory: {
      used: number;
      free: number;
      percentage: number;
    };
  };
  performance: {
    responseTime: number;
    averageResponseTime?: number;
  };
  version?: string;
}

// Store response times for averaging
const responseTimes: number[] = [];
const maxResponseTimeHistory = 100;

/**
 * Health monitoring and performance tracking
 */
export function registerHealthRoutes(app: Express) {
  
  // Detailed health check endpoint
  app.get('/health', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const healthCheck: HealthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: false,
        storage: false,
        memory: getMemoryInfo(),
      },
      performance: {
        responseTime: 0,
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    try {
      // Test database connectivity
      healthCheck.services.database = await testDatabaseConnection();
      
      // Test storage functionality
      healthCheck.services.storage = await testStorageConnection();
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      healthCheck.performance.responseTime = responseTime;
      
      // Track response times for averaging
      responseTimes.push(responseTime);
      if (responseTimes.length > maxResponseTimeHistory) {
        responseTimes.shift();
      }
      
      healthCheck.performance.averageResponseTime = 
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

      // Determine overall health status
      if (!healthCheck.services.database || !healthCheck.services.storage) {
        healthCheck.status = 'degraded';
      }
      
      if (healthCheck.performance.responseTime > 5000 || 
          healthCheck.services.memory.percentage > 90) {
        healthCheck.status = 'unhealthy';
      }

      const statusCode = healthCheck.status === 'healthy' ? 200 : 
                        healthCheck.status === 'degraded' ? 200 : 503;

      res.status(statusCode).json(healthCheck);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(503).json({
        ...healthCheck,
        status: 'unhealthy',
        error: 'Health check failed',
        performance: {
          responseTime: Date.now() - startTime,
        },
      });
    }
  });

  // Simple health check for load balancers
  app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Ready check for Kubernetes/deployment orchestration
  app.get('/ready', async (req: Request, res: Response) => {
    try {
      const dbHealthy = await testDatabaseConnection();
      const storageHealthy = await testStorageConnection();
      
      if (dbHealthy && storageHealthy) {
        res.status(200).json({ status: 'ready' });
      } else {
        res.status(503).json({ status: 'not ready' });
      }
    } catch (error) {
      res.status(503).json({ status: 'not ready', error: 'Service check failed' });
    }
  });

  // Performance metrics endpoint
  app.get('/metrics', (req: Request, res: Response) => {
    const metrics = {
      uptime: process.uptime(),
      memory: getMemoryInfo(),
      cpu: process.cpuUsage(),
      responseTime: {
        current: responseTimes[responseTimes.length - 1] || 0,
        average: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length || 0,
        min: Math.min(...responseTimes) || 0,
        max: Math.max(...responseTimes) || 0,
      },
      timestamp: new Date().toISOString(),
    };
    
    res.json(metrics);
  });
}

async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Test a simple database operation
    await storage.getBands();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

async function testStorageConnection(): Promise<boolean> {
  try {
    // Test storage methods are available
    return typeof storage.getBands === 'function' && 
           typeof storage.getReviews === 'function';
  } catch (error) {
    console.error('Storage health check failed:', error);
    return false;
  }
}

function getMemoryInfo() {
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const freeMemory = totalMemory - usedMemory;
  
  return {
    used: Math.round(usedMemory / 1024 / 1024), // MB
    free: Math.round(freeMemory / 1024 / 1024), // MB
    percentage: Math.round((usedMemory / totalMemory) * 100),
  };
}

/**
 * Performance monitoring middleware with optimization hints
 */
export function performanceMiddleware(req: Request, res: Response, next: Function) {
  const startTime = Date.now();
  
  // Add cache headers for optimization
  if (req.method === 'GET') {
    // Static assets
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // API responses
    else if (req.path.startsWith('/api/')) {
      if (req.path.match(/\/(bands|tours|reviews|photos)$/)) {
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      }
    }
  }
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests with more detail
    if (duration > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.path} took ${duration}ms`);
      
      // Provide optimization hints for common slow endpoints
      if (req.path.includes('/api/ai-chat/')) {
        console.log('💡 Hint: Consider implementing streaming responses for AI chat');
      } else if (req.path.includes('/api/search')) {
        console.log('💡 Hint: Consider implementing search result pagination');
      } else if (req.path.includes('/api/tours')) {
        console.log('💡 Hint: Consider adding database indexes for tour queries');
      }
    }
    
    // Track performance metrics
    if (duration > 500) {
      // Could send to monitoring service here
      console.log(`📊 Performance: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
}