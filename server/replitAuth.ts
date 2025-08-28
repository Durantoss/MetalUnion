import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import MemoryStore from "memorystore";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days for better persistence
  const MemStore = MemoryStore(session);
  const sessionStore = new MemStore({
    checkPeriod: 86400000, // prune expired entries every 24h
    ttl: sessionTtl,
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Extend session on activity
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Store the 'remember' parameter in session for post-login handling
    const rememberUser = req.query.remember === 'true';
    if (req.session) {
      (req.session as any).rememberUser = rememberUser;
    }
    
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, (err: any, user: any) => {
      if (err || !user) {
        return res.redirect("/api/login");
      }
      
      req.logIn(user, (err) => {
        if (err) {
          return res.redirect("/api/login");
        }
        
        // Handle remember me functionality
        const rememberUser = (req.session as any)?.rememberUser;
        if (rememberUser && req.session) {
          // Extend session for remember me (90 days)
          const extendedTtl = 90 * 24 * 60 * 60 * 1000;
          req.session.cookie.maxAge = extendedTtl;
        }
        
        // Clean up the remember flag
        if (req.session) {
          delete (req.session as any).rememberUser;
        }
        
        const returnTo = (req.session as any)?.returnTo || "/";
        if (req.session) {
          delete (req.session as any).returnTo;
        }
        
        res.redirect(returnTo);
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    const clearRemember = req.query.clear === 'true';
    
    req.logout(() => {
      // Clear session
      if (req.session) {
        req.session.destroy(() => {
          res.clearCookie('connect.sid');
          
          const logoutUrl = client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}${clearRemember ? '?clear=true' : ''}`,
          }).href;
          
          res.redirect(logoutUrl);
        });
      } else {
        res.redirect("/");
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  // Give some buffer time (5 minutes) before token expires
  const bufferTime = 5 * 60; // 5 minutes in seconds
  
  if (now <= (user.expires_at - bufferTime)) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    
    // Update the user in database to keep their profile fresh
    await upsertUser(tokenResponse.claims());
    
    return next();
  } catch (error) {
    console.error('Token refresh failed:', error);
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};