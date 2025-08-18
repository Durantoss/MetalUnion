import bcrypt from 'bcrypt';
import session from 'express-session';
import type { Express, Request, Response, NextFunction } from 'express';
import connectPgSimple from 'connect-pg-simple';
import { storage } from './storage';
import type { CreateUser, LoginRequest } from '@shared/schema';

// Configure session middleware
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPgSimple(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'mosh-union-secret-2025',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

// Authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).userId) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

// Optional authentication middleware (doesn't block if not authenticated)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Just pass through, but user ID will be available if authenticated
  next();
};

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password utility
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Setup authentication routes and middleware
export async function setupAuth(app: Express) {
  // Add session middleware
  app.use(getSession());
  
  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { stagename, safeword, email } = req.body;
      
      // Validate required fields
      if (!stagename || !safeword) {
        return res.status(400).json({ 
          error: 'Stagename and safeword are required' 
        });
      }
      
      // Check if stagename is already taken
      const existingUser = await storage.getUserByStagename(stagename);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Stagename already taken. Please choose a different one.' 
        });
      }
      
      // Note: Email uniqueness checking can be added later if needed
      
      // Hash the password
      const hashedPassword = await hashPassword(safeword);
      
      // Create user
      const userData: CreateUser = {
        stagename,
        safeword: hashedPassword,
        email: email || null,
        reputationPoints: 0,
        badges: [],
        concertAttendanceCount: 0,
        commentCount: 0,
        reviewCount: 0,
        isOnline: true,
        loginStreak: 1,
        totalReviews: 0,
        totalPhotos: 0,
        totalLikes: 0,
        rememberMe: false,
        proximityEnabled: false,
        proximityRadius: 500,
        shareLocationAtConcerts: false,
        role: 'user',
        isAdmin: false,
        permissions: {}
      };
      
      const user = await storage.createUser(userData);
      
      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).stagename = user.stagename;
      
      // Return user data (without password)
      const { safeword: _, ...userResponse } = user;
      res.status(201).json({ 
        message: 'Registration successful',
        user: userResponse 
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Registration failed' 
      });
    }
  });
  
  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      console.log('Login attempt:', { stagename: req.body.stagename, hasPassword: !!req.body.safeword });
      const { stagename, safeword, rememberMe } = req.body;
      
      // Validate required fields
      if (!stagename || !safeword) {
        console.log('Missing required fields');
        return res.status(400).json({ 
          error: 'Stagename and safeword are required' 
        });
      }
      
      // Get user by stagename
      const user = await storage.getUserByStagename(stagename);
      if (!user) {
        console.log('User not found:', stagename);
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }
      
      // Verify password
      const isValidPassword = await verifyPassword(safeword, user.safeword || '');
      if (!isValidPassword) {
        console.log('Invalid password for user:', stagename);
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }
      
      console.log('Authentication successful for:', stagename);
      
      // Update last login
      await storage.updateUserLastLogin(user.id, rememberMe || false);
      
      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).stagename = user.stagename;
      (req.session as any).isAdmin = user.isAdmin;
      
      console.log('Session set:', { userId: user.id, stagename: user.stagename });
      
      // Extend session if remember me is selected
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }
      
      // Return user data (without password)
      const { safeword: _, ...userResponse } = user;
      console.log('Login response sent successfully');
      res.json({ 
        message: 'Login successful',
        user: userResponse 
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Login failed' 
      });
    }
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });
  
  // Current user endpoint
  app.get('/api/auth/user', optionalAuth, async (req: Request, res: Response) => {
    try {
      console.log('Auth check - Session:', { 
        hasSession: !!req.session,
        userId: (req.session as any)?.userId,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        cookies: req.headers.cookie
      });
      
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        console.log('No userId in session, returning 401');
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return user data (without password)
      const { safeword: _, ...userResponse } = user;
      res.json(userResponse);
      
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });
  
  // Check stagename availability
  app.get('/api/auth/check-stagename/:stagename', async (req: Request, res: Response) => {
    try {
      const { stagename } = req.params;
      const isAvailable = await storage.checkStagenameAvailable(stagename);
      res.json({ available: isAvailable });
    } catch (error) {
      console.error('Check stagename error:', error);
      res.status(500).json({ error: 'Failed to check stagename' });
    }
  });
}