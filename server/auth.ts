import bcrypt from 'bcrypt';
import type { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
import type { CreateUser, LoginRequest } from '@shared/schema';

const SALT_ROUNDS = 12;

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days default
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'moshunion-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Extend session on activity
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setupAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());

  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData: CreateUser = req.body;
      
      // Check if stagename is available
      const isAvailable = await storage.checkStagenameAvailable(userData.stagename);
      if (!isAvailable) {
        return res.status(400).json({ 
          error: 'Stagename already taken',
          field: 'stagename'
        });
      }

      // Hash the password
      const hashedPassword = await hashPassword(userData.safeword);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...userData,
        safeword: hashedPassword,
      });

      // Set up session
      (req.session as any).userId = newUser.id;
      (req.session as any).stagename = newUser.stagename;
      
      // Check for initial badges
      await storage.checkBadgeEligibility(newUser.id);
      
      res.json({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          stagename: newUser.stagename,
          email: newUser.email,
          reputationPoints: newUser.reputationPoints,
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const loginData: LoginRequest = req.body;
      
      const user = await storage.authenticateUser(loginData);
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid stagename or safeword' 
        });
      }

      // Set up session
      (req.session as any).userId = user.id;
      (req.session as any).stagename = user.stagename;
      
      // Update session duration based on remember me
      if (loginData.rememberMe) {
        const extendedTtl = 90 * 24 * 60 * 60 * 1000; // 90 days
        req.session.cookie.maxAge = extendedTtl;
      }
      
      // Update last login
      await storage.updateUserLastLogin(user.id, loginData.rememberMe || false);
      
      // Check for new badges
      await storage.checkBadgeEligibility(user.id);
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          stagename: user.stagename,
          email: user.email,
          reputationPoints: user.reputationPoints,
          rememberMe: loginData.rememberMe,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userBadges = await storage.getUserBadges(userId);
      
      res.json({
        id: user.id,
        stagename: user.stagename,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        location: user.location,
        favoriteGenres: user.favoriteGenres,
        reputationPoints: user.reputationPoints,
        concertAttendanceCount: user.concertAttendanceCount,
        commentCount: user.commentCount,
        reviewCount: user.reviewCount,
        loginStreak: user.loginStreak,
        lastLoginAt: user.lastLoginAt,
        rememberMe: user.rememberMe,
        badges: userBadges,
        isOnline: true,
      });
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

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
};