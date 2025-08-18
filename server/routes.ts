import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBandSchema, 
  insertReviewSchema, 
  insertPhotoSchema, 
  insertTourSchema, 
  insertMessageSchema, 
  insertPitMessageSchema, 
  insertPitReplySchema, 
  insertCommentSchema, 
  insertCommentReactionSchema,
  insertUserGroupSchema,
  insertGroupMemberSchema,
  insertGroupPostSchema,
  insertMentorProfileSchema,
  insertMentorshipSchema,
  insertSocialConnectionSchema,
  insertReactionTypeSchema,
  insertContentReactionSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertChatParticipantSchema,
  insertFriendRequestSchema,
  insertUserConnectionSchema,
  insertConversationSchema,
  insertDirectMessageSchema,
  insertMessageEncryptionKeySchema,
  insertMessageDeliveryReceiptSchema
, users } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth";
import { db } from "./db";

import { eq, desc, and } from "drizzle-orm";
import { 
  users, 
  bands, 
  reviews, 
  photos, 
  tours, 
  userLocations, 
  proximityMatches,
  badges,
  userBadges,
  followSystem,
  mentorPairs,
  discussionPosts,
  discussionComments,
  groups,
  groupMembers,
  socialConnections,
  reactionTypes,
  contentReactions,
  friendRequests,
  userConnections,
  messages,
  chatMessages,
  chatRooms,
  chatParticipants
} from "@shared/schema";
import { performGoogleSearch } from "./googleSearch";
import { tourDataService } from "./tourDataService";
import { aiService, type BandRecommendation, type ChatResponse } from "./aiService";
import { EventDiscoveryService } from "./eventDiscoveryService";
import { MultiPlatformEventService } from "./multiPlatformEventService";
import { concertRecommendationService, type ConcertRecommendation, type ConcertRecommendationRequest } from "./concertRecommendationService";
import { ticketmasterService } from "./ticketmasterService";
import { MessagingWebSocketServer } from "./websocket";
import { MessageEncryption } from "./encryption";
import multer from "multer";
import path from "path";

// Authentication middleware
const requireAuthentication = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

async function seedDatabase() {
  try {
    // Get existing bands and check for duplicates by name
    const existingBands = await storage.getBands();
    const existingBandNames = new Set(existingBands.map(b => b.name.toLowerCase()));
    
    console.log(`Found ${existingBands.length} existing bands in database`);
    
    // Seed chat rooms if they don't exist
    await seedChatRooms();
    
    // Only seed if we have fewer than 5 unique bands
    if (existingBands.length < 5) {
      console.log("Seeding database with initial bands...");
      
      // Create top 10 rock/metal bands if they don't exist
      const bandData = [
        {
          name: "LINKIN PARK",
          genre: "Nu Metal",
          description: "Pioneering nu-metal band with massive Spotify presence (60.4M monthly listeners). Known for their fusion of rock, hip-hop, and electronic elements.",
          imageUrl: null,
          founded: 1996,
          members: ["Mike Shinoda", "Brad Delson", "Dave Farrell", "Joe Hahn", "Rob Bourdon", "Emily Armstrong"],
          albums: ["Hybrid Theory", "Meteora", "Minutes to Midnight", "A Thousand Suns", "Living Things"],
          website: "https://linkinpark.com",
          instagram: "https://instagram.com/linkinpark",
        },
        {
          name: "QUEEN",
          genre: "Rock",
          description: "Legendary British rock band with global appeal (52.8M monthly listeners). Timeless classics that span generations with theatrical performances.",
          imageUrl: null,
          founded: 1970,
          members: ["Freddie Mercury", "Brian May", "Roger Taylor", "John Deacon"],
          albums: ["Queen", "A Night at the Opera", "News of the World", "The Game", "Innuendo"],
          website: "https://queenonline.com",
          instagram: "https://instagram.com/officialqueenmusic",
        },
        {
          name: "AC/DC",
          genre: "Hard Rock",
          description: "Australian hard rock titans with consistent streaming power (37.7M monthly listeners). High-voltage rock and roll since the 1970s.",
          imageUrl: null,
          founded: 1973,
          members: ["Angus Young", "Brian Johnson", "Phil Rudd", "Cliff Williams", "Stevie Young"],
          albums: ["High Voltage", "Highway to Hell", "Back in Black", "For Those About to Rock", "The Razors Edge"],
          website: "https://acdc.com",
          instagram: "https://instagram.com/acdc",
        },
        {
          name: "RED HOT CHILI PEPPERS",
          genre: "Alternative Rock",
          description: "Funk rock pioneers with crossover success (36.7M monthly listeners). Blending rock, funk, and rap with California attitude.",
          imageUrl: null,
          founded: 1982,
          members: ["Anthony Kiedis", "Flea", "Chad Smith", "John Frusciante"],
          albums: ["Blood Sugar Sex Magik", "Californication", "By the Way", "Stadium Arcadium", "Unlimited Love"],
          website: "https://redhotchilipeppers.com",
          instagram: "https://instagram.com/chilipeppers",
        },
        {
          name: "GREEN DAY",
          genre: "Pop Punk",
          description: "Pop-punk legends with mainstream staying power (36.4M monthly listeners). Defined the 90s punk revival and continue to evolve.",
          imageUrl: null,
          founded: 1987,
          members: ["Billie Joe Armstrong", "Mike Dirnt", "Tré Cool"],
          albums: ["Dookie", "Insomniac", "American Idiot", "21st Century Breakdown", "Revolution Radio"],
          website: "https://greenday.com",
          instagram: "https://instagram.com/greenday",
        },
        {
          name: "NIRVANA",
          genre: "Grunge",
          description: "Grunge pioneers with lasting cultural impact (32.9M monthly listeners). Defined alternative rock and the Seattle sound of the 90s.",
          imageUrl: null,
          founded: 1987,
          members: ["Kurt Cobain", "Krist Novoselic", "Dave Grohl"],
          albums: ["Bleach", "Nevermind", "In Utero", "MTV Unplugged in New York"],
          website: "https://nirvana.com",
          instagram: "https://instagram.com/nirvana",
        },
        {
          name: "TWENTY ONE PILOTS",
          genre: "Alternative Rock",
          description: "Modern alternative rock with metal influences (30.9M monthly listeners). Genre-blending duo from Columbus with devoted fanbase.",
          imageUrl: null,
          founded: 2009,
          members: ["Tyler Joseph", "Josh Dun"],
          albums: ["Vessel", "Blurryface", "Trench", "Scaled and Icy", "Clancy"],
          website: "https://twentyonepilots.com",
          instagram: "https://instagram.com/twentyonepilots",
        },
        {
          name: "GUNS N' ROSES",
          genre: "Hard Rock",
          description: "Hard rock icons maintaining streaming relevance (30.4M monthly listeners). Los Angeles rock legends with a rebellious attitude.",
          imageUrl: null,
          founded: 1985,
          members: ["Axl Rose", "Slash", "Duff McKagan", "Dizzy Reed", "Richard Fortus", "Frank Ferrer", "Melissa Reese"],
          albums: ["Appetite for Destruction", "G N' R Lies", "Use Your Illusion I", "Use Your Illusion II", "Chinese Democracy"],
          website: "https://gunsnroses.com",
          instagram: "https://instagram.com/gunsnroses",
        },
        {
          name: "BON JOVI",
          genre: "Arena Rock",
          description: "Arena rock veterans with broad appeal (30.0M monthly listeners). New Jersey rock icons known for anthemic choruses and stadium shows.",
          imageUrl: null,
          founded: 1983,
          members: ["Jon Bon Jovi", "David Bryan", "Tico Torres", "Phil X"],
          albums: ["Bon Jovi", "Slippery When Wet", "New Jersey", "Keep the Faith", "These Days"],
          website: "https://bonjovi.com",
          instagram: "https://instagram.com/bonjovi",
        },
        {
          name: "RADIOHEAD",
          genre: "Alternative Rock",
          description: "Art rock innovators with devoted fanbase (29.7M monthly listeners). Experimental British band pushing the boundaries of rock music.",
          imageUrl: null,
          founded: 1985,
          members: ["Thom Yorke", "Jonny Greenwood", "Colin Greenwood", "Ed O'Brien", "Philip Selway"],
          albums: ["OK Computer", "Kid A", "In Rainbows", "Hail to the Thief", "A Moon Shaped Pool"],
          website: "https://radiohead.com",
          instagram: "https://instagram.com/radiohead",
        }
      ];

      // Only create bands that don't already exist
      for (const band of bandData) {
        if (!existingBandNames.has(band.name.toLowerCase())) {
          await storage.createBand(band);
        }
      }

      console.log("Database seeded successfully!");
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}

async function seedChatRooms() {
  try {
    // Check if chat rooms already exist
    const existingRooms = await db.select().from(chatRooms);
    
    if (existingRooms.length === 0) {
      console.log("Seeding chat rooms...");
      
      const defaultRooms = [
        {
          id: 'general',
          name: 'General Discussion',
          topic: 'General chat for all metalheads',
          description: 'Welcome to the main discussion room where everyone can chat about music, life, and everything metal',
          isActive: true,
          maxUsers: 100,
          currentUsers: 0
        },
        {
          id: 'new-releases',
          name: 'New Releases',
          topic: 'Latest album drops and music news',
          description: 'Discuss the hottest new metal releases and upcoming albums',
          isActive: true,
          maxUsers: 50,
          currentUsers: 0
        },
        {
          id: 'concert-talk',
          name: 'Concert Talk',
          topic: 'Live shows, festivals, and concert experiences',
          description: 'Share your concert experiences and find show buddies',
          isActive: true,
          maxUsers: 75,
          currentUsers: 0
        },
        {
          id: 'gear-discussion',
          name: 'Gear Discussion',
          topic: 'Instruments, equipment, and gear talk',
          description: 'Talk about guitars, amps, pedals, and all things gear-related',
          isActive: true,
          maxUsers: 30,
          currentUsers: 0
        }
      ];

      for (const room of defaultRooms) {
        await db.insert(chatRooms).values(room);
      }
      
      console.log(`Seeded ${defaultRooms.length} chat rooms`);
    }
  } catch (error) {
    console.error('Error seeding chat rooms:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment monitoring - must come first
  app.get('/health', (_req, res) => {
    // Simple health check - if the server can respond, it's healthy
    // Database connectivity is implicitly tested by the main app functionality
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      server: 'running',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  });

  // Auth middleware
  await setupAuth(app);

  // Seed database with initial data
  await seedDatabase();

  // Initialize tour data refresh (run once on startup)
  setTimeout(async () => {
    try {
      await tourDataService.refreshTourDatabase();
      console.log('Initial tour data refresh completed');
    } catch (error) {
      console.error('Initial tour data refresh failed:', error);
    }
  }, 5000); // Wait 5 seconds after startup





  // Authentication check endpoint for persistent sessions
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('Auth check - Session:', {
        hasSession: !!req.session,
        userId: req.session?.userId,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        cookies: req.headers.cookie
      });

      // Check if user is authenticated via session
      if (!req.session || !req.session.userId) {
        console.log('No userId in session, returning 401');
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.log('User not found in database, returning 401');
        return res.status(401).json({ error: 'User not found' });
      }

      console.log('Auth check successful for user:', user.stagename);
      res.json(user);
    } catch (error) {
      console.error('Error checking auth status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User profile and account management routes
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Get user's bands count
      const userBands = await storage.getBandsByOwner(userId);
      
      // Get user's reviews count (would need to add userId to reviews in a real app)
      const allReviews = await storage.getReviews();
      const userReviews = allReviews.filter(review => 
        // For now, match by stagename since we don't have userId in reviews
        userBands.some(band => band.name === review.stagename)
      );
      
      // Get user's photos count (would need to add userId to photos in a real app)
      const allPhotos = await storage.getPhotos();
      const userPhotos = allPhotos.filter(photo => 
        userBands.some(band => band.id === photo.bandId)
      );
      
      const user = await storage.getUser(userId);
      
      res.json({
        bandsSubmitted: userBands.length,
        reviewsWritten: userReviews.length,
        photosUploaded: userPhotos.length,
        memberSince: user?.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Bands endpoints
  app.get('/api/bands', async (req, res) => {
    try {
      // Explicitly set JSON headers to prevent Vite middleware interference
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      
      const bands = await storage.getBands();
      res.json(bands);
    } catch (error) {
      console.error("Error fetching bands:", error);
      res.status(500).json({ message: "Failed to fetch bands" });
    }
  });

  app.get('/api/bands/:id', async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      const { id } = req.params;
      const band = await storage.getBand(id);
      if (!band) {
        return res.status(404).json({ message: "Band not found" });
      }
      res.json(band);
    } catch (error) {
      console.error("Error fetching band:", error);
      res.status(500).json({ message: "Failed to fetch band" });
    }
  });

  app.post('/api/bands', isAuthenticated, async (req: any, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      const validatedData = insertBandSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      const band = await storage.createBandSubmission({ ...validatedData, ownerId: userId });
      res.status(201).json(band);
    } catch (error) {
      console.error("Error creating band:", error);
      res.status(500).json({ message: "Failed to create band" });
    }
  });

  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, stagename } = req.body;
      
      if (!firstName || !lastName || !stagename) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check stagename availability if changed
      const currentUser = await storage.getUser(userId);
      if (currentUser?.stagename !== stagename) {
        const available = await storage.checkStagenameAvailable(stagename);
        if (!available) {
          return res.status(409).json({ message: "Stagename already taken" });
        }
      }
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        stagename,
        email: currentUser?.email,
        profileImageUrl: currentUser?.profileImageUrl,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // For now, return default preferences since we don't have a preferences table
      // In a real app, you'd have a user_preferences table
      const defaultPreferences = {
        id: userId,
        userId,
        emailNotifications: true,
        tourAlerts: true,
        reviewNotifications: true,
        bandUpdates: true,
        profileVisibility: "public" as const,
        preferredGenres: [],
        autoApprovePhotos: false,
      };
      
      res.json(defaultPreferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = req.body;
      
      // In a real app, you'd save these to a user_preferences table
      // For now, just return the updated preferences
      const updatedPreferences = {
        id: userId,
        userId,
        ...preferences,
      };
      
      res.json(updatedPreferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.post('/api/user/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, stagename, favoriteGenres, notifications } = req.body;
      
      if (!firstName || !lastName || !stagename) {
        return res.status(400).json({ message: "All profile fields are required" });
      }
      
      // Check stagename availability
      const available = await storage.checkStagenameAvailable(stagename);
      if (!available) {
        return res.status(409).json({ message: "Stagename already taken" });
      }
      
      const currentUser = await storage.getUser(userId);
      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        stagename,
        email: currentUser?.email,
        profileImageUrl: currentUser?.profileImageUrl,
      });
      
      // In a real app, you'd also save the favorite genres and notification preferences
      // For now, just return success
      
      res.json({ 
        user: updatedUser, 
        message: "Onboarding completed successfully",
        preferences: {
          favoriteGenres,
          notifications
        }
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  app.delete('/api/user/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // In a real app, you'd delete all user data:
      // - User record
      // - User's bands
      // - User's reviews
      // - User's photos
      // - User's preferences
      // - User's sessions
      
      // For now, just return success (since we can't actually delete from the auth provider)
      res.json({ message: "Account deletion initiated. You will be logged out shortly." });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Stagename routes
  app.get('/api/stagename/check/:stagename', async (req, res) => {
    try {
      const { stagename } = req.params;
      if (!stagename || stagename.length < 2) {
        return res.status(400).json({ message: "Stagename must be at least 2 characters" });
      }
      const available = await storage.checkStagenameAvailable(stagename);
      res.json({ available, stagename });
    } catch (error) {
      res.status(500).json({ message: "Failed to check stagename availability" });
    }
  });

  app.put('/api/auth/user/stagename', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { stagename } = req.body;
      
      if (!stagename || stagename.length < 2 || stagename.length > 50) {
        return res.status(400).json({ message: "Stagename must be 2-50 characters" });
      }
      
      // Check if stagename is available
      const available = await storage.checkStagenameAvailable(stagename);
      if (!available) {
        return res.status(409).json({ message: "Stagename already taken" });
      }
      
      const user = await storage.updateUserStagename(userId, stagename);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating stagename:", error);
      res.status(500).json({ message: "Failed to update stagename" });
    }
  });

  // Enhanced search endpoint with Google integration
  app.get("/api/search", async (req, res) => {
    try {
      const { q: query, section } = req.query;
      
      if (!query || !section) {
        return res.status(400).json({ error: 'Query and section parameters are required' });
      }

      console.log(`Search request: "${query}" in section "${section}"`);
      
      // Perform Google search (will fallback to local if no API keys)
      const googleResults = await performGoogleSearch(query as string, section as string);
      
      res.json({ 
        query: query,
        section: section,
        googleResults: googleResults,
        message: googleResults ? 'Google search results' : 'Using local search fallback',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // The Pit message board routes
  app.get('/api/pit/messages', async (req, res) => {
    try {
      const messages = await storage.getPitMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching pit messages:", error);
      res.status(500).json({ message: "Failed to fetch pit messages" });
    }
  });

  app.post('/api/pit/messages', async (req, res) => {
    try {
      const validatedData = insertPitMessageSchema.parse(req.body);
      const message = await storage.createPitMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating pit message:", error);
      res.status(500).json({ message: "Failed to create pit message" });
    }
  });

  app.get('/api/pit/messages/:messageId/replies', async (req, res) => {
    try {
      const { messageId } = req.params;
      const replies = await storage.getPitReplies(messageId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching pit replies:", error);
      res.status(500).json({ message: "Failed to fetch pit replies" });
    }
  });

  app.post('/api/pit/messages/:messageId/replies', async (req, res) => {
    try {
      const { messageId } = req.params;
      const validatedData = insertPitReplySchema.parse({ ...req.body, messageId });
      const reply = await storage.createPitReply(validatedData);
      
      // Update reply count
      await storage.incrementPitMessageReplies(messageId);
      
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating pit reply:", error);
      res.status(500).json({ message: "Failed to create pit reply" });
    }
  });

  app.post('/api/pit/messages/:messageId/like', async (req, res) => {
    try {
      const { messageId } = req.params;
      await storage.incrementPitMessageLikes(messageId);
      res.json({ message: 'Like added successfully' });
    } catch (error) {
      console.error("Error liking pit message:", error);
      res.status(500).json({ message: "Failed to like pit message" });
    }
  });

  app.post('/api/pit/replies/:replyId/like', async (req, res) => {
    try {
      const { replyId } = req.params;
      await storage.incrementPitReplyLikes(replyId);
      res.json({ message: 'Like added successfully' });
    } catch (error) {
      console.error("Error liking pit reply:", error);
      res.status(500).json({ message: "Failed to like pit reply" });
    }
  });

  // Comment system routes
  app.get('/api/comments/:targetType/:targetId', async (req, res) => {
    try {
      const { targetType, targetId } = req.params;
      const comments = await storage.getComments(targetType, targetId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.put('/api/comments/:commentId', async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const comment = await storage.updateComment(commentId, content);
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete('/api/comments/:commentId', async (req, res) => {
    try {
      const { commentId } = req.params;
      const { reason } = req.body;
      await storage.deleteComment(commentId, reason || 'Deleted by user');
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.post('/api/comments/:commentId/react', async (req, res) => {
    try {
      const { commentId } = req.params;
      const validatedData = insertCommentReactionSchema.parse({ ...req.body, commentId });
      const reaction = await storage.createCommentReaction(validatedData);
      res.status(201).json(reaction);
    } catch (error) {
      console.error("Error creating comment reaction:", error);
      res.status(500).json({ message: "Failed to react to comment" });
    }
  });

  // Event Discovery API endpoints  
  const eventDiscoveryService = new EventDiscoveryService();
  const multiPlatformEventService = new MultiPlatformEventService();

  // Discover events with multi-platform search and AI-powered recommendations
  // Basic tours endpoint to get all upcoming tours
  app.get('/api/tours', async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      const tours = await storage.getUpcomingTours();
      
      // Enhance tours with band information
      const enhancedTours = await Promise.all(
        tours.map(async (tour) => {
          const band = await storage.getBand(tour.bandId);
          return {
            ...tour,
            bandName: band?.name || 'Unknown Band',
            bandImageUrl: band?.imageUrl || null,
            bandGenres: band?.genres || []
          };
        })
      );
      
      res.json(enhancedTours);
    } catch (error) {
      console.error("Error fetching tours:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  // Tour discovery endpoint with Google + OpenAI integration
  app.post('/api/tours/discover', async (req, res) => {
    try {
      const { TourDiscoveryService } = await import('./tourDiscoveryService');
      const tourService = new TourDiscoveryService();
      console.log('Tour discovery request received:', req.body);
      const tours = await tourService.discoverTours(req.body);
      console.log(`Returning ${tours.length} tours to client`);
      res.json(tours);
    } catch (error) {
      console.error('Tour discovery error:', error);
      res.status(500).json({ error: 'Failed to discover tours' });
    }
  });

  app.post('/api/events/discover', async (req, res) => {
    try {
      const request = req.body;
      console.log('Event discovery request received:', request);
      
      // Use the new multi-platform service instead of the old Google-based one
      const events = await multiPlatformEventService.discoverEvents(request);
      console.log(`Returning ${events.length} events to client`);
      
      res.json(events);
    } catch (error) {
      console.error('Error discovering events:', error);
      res.status(500).json({ error: 'Failed to discover events' });
    }
  });

  // Get personalized event recommendations using multi-platform search
  app.post('/api/events/personalized', async (req, res) => {
    try {
      const request = req.body;
      
      // Add user preferences to request
      const enhancedRequest = {
        ...request,
        favoriteArtists: request.favoriteArtists || ['Metallica', 'Iron Maiden', 'Black Sabbath'],
        preferredGenres: request.preferredGenres || ['metal', 'rock', 'hardcore']
      };
      
      const events = await multiPlatformEventService.discoverEvents(enhancedRequest);
      res.json(events);
    } catch (error) {
      console.error('Error getting personalized events:', error);
      res.status(500).json({ error: 'Failed to get personalized recommendations' });
    }
  });

  // Get detailed insights for a specific event
  app.get('/api/events/:eventId/insights', async (req, res) => {
    try {
      const { eventId } = req.params;
      
      // This is a simplified implementation - in a real app you'd store events in DB
      // For demo purposes, we'll generate insights based on a mock event
      const mockEvent = {
        id: eventId,
        title: 'Concert Event',
        artist: 'Rock Band',
        venue: 'Music Venue',
        date: '2025-09-15',
        time: '20:00',
        platform: 'demo',
        location: {
          address: '123 Music St',
          city: 'Rock City',
          state: 'CA',
        },
        price: { min: 50, max: 150, currency: 'USD' },
        ticketUrl: 'https://example.com/tickets',
        description: 'Amazing rock concert',
        genre: 'Rock',
        relevanceScore: 0.9,
        aiRecommendationReason: 'Great match for metal fans'
      };
      
      const insights = await multiPlatformEventService.generateEventInsights(mockEvent);
      res.json(insights);
    } catch (error) {
      console.error('Error getting event insights:', error);
      res.status(500).json({ error: 'Failed to get event insights' });
    }
  });

  // Enhanced Social Features API Routes

  // User Groups & Communities
  app.get('/api/groups', async (req, res) => {
    try {
      const groups = await storage.getUserGroups();
      res.json(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ error: 'Failed to fetch groups' });
    }
  });

  app.post('/api/groups', async (req, res) => {
    try {
      const groupData = insertUserGroupSchema.parse(req.body);
      const group = await storage.createUserGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  });

  app.post('/api/groups/:groupId/join', async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user?.claims?.sub || 'demo-user';
      
      const membership = await storage.joinGroup(groupId, userId);
      res.status(201).json(membership);
    } catch (error) {
      console.error('Error joining group:', error);
      res.status(500).json({ error: 'Failed to join group' });
    }
  });

  // Mentorship System
  app.get('/api/mentors', async (req, res) => {
    try {
      const mentors = await storage.getMentorProfiles();
      res.json(mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      res.status(500).json({ error: 'Failed to fetch mentors' });
    }
  });

  app.post('/api/mentorship/request', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user';
      
      const mentorshipData = insertMentorshipSchema.parse({ 
        ...req.body, 
        menteeId: userId 
      });
      const mentorship = await storage.requestMentorship(mentorshipData);
      res.status(201).json(mentorship);
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      res.status(500).json({ error: 'Failed to request mentorship' });
    }
  });

  // Live Chat System
  app.get('/api/chat/rooms', async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ error: 'Failed to fetch chat rooms' });
    }
  });

  app.get('/api/chat/rooms/:roomId/messages', async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await storage.getChatMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  app.post('/api/chat/rooms/:roomId/join', async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user?.claims?.sub || 'demo-user';
      
      const participation = await storage.joinChatRoom(roomId, userId);
      res.status(201).json(participation);
    } catch (error) {
      console.error('Error joining chat room:', error);
      res.status(500).json({ error: 'Failed to join chat room' });
    }
  });

  app.get('/api/chat/rooms/:roomId/users', async (req, res) => {
    try {
      const { roomId } = req.params;
      const users = await storage.getChatRoomUsers(roomId);
      res.json(users);
    } catch (error) {
      console.error('Error fetching chat room users:', error);
      res.status(500).json({ error: 'Failed to fetch chat room users' });
    }
  });

  // Friend System
  app.get('/api/friend-requests/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const requests = await storage.getFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      res.status(500).json({ error: 'Failed to fetch friend requests' });
    }
  });

  app.post('/api/friend-requests', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user';
      
      const requestData = insertFriendRequestSchema.parse({ 
        ...req.body, 
        senderId: userId 
      });
      const request = await storage.sendFriendRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ error: 'Failed to send friend request' });
    }
  });

  // Social Media Connections
  app.get('/api/social-connections/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const connections = await storage.getSocialConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error('Error fetching social connections:', error);
      res.status(500).json({ error: 'Failed to fetch social connections' });
    }
  });

  app.post('/api/social-connections', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user';
      
      const connectionData = insertSocialConnectionSchema.parse({ 
        ...req.body, 
        userId 
      });
      const connection = await storage.createSocialConnection(connectionData);
      res.status(201).json(connection);
    } catch (error) {
      console.error('Error creating social connection:', error);
      res.status(500).json({ error: 'Failed to create social connection' });
    }
  });

  // Online Users
  app.get('/api/users/online', async (req, res) => {
    try {
      const users = await storage.getOnlineUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching online users:', error);
      res.status(500).json({ error: 'Failed to fetch online users' });
    }
  });

  // Secure Direct Messaging Routes
  
  // Get user's conversations
  app.get('/api/direct-messages/conversations', async (req, res) => {
    try {
      const userId = req.query.userId as string || req.user?.claims?.sub || 'demo-user';
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  // Create new conversation
  app.post('/api/direct-messages/conversations', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user';
      const conversationData = insertConversationSchema.parse({
        ...req.body,
        participant1Id: userId
      });
      const conversation = await storage.createConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  // Get messages for a conversation
  app.get('/api/direct-messages/:conversationId/messages', async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Send new message
  app.post('/api/direct-messages', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user';
      const messageData = insertDirectMessageSchema.parse({
        ...req.body,
        senderId: userId
      });
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Mark message as read
  app.patch('/api/direct-messages/:messageId/read', async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user?.claims?.sub || 'demo-user';
      await storage.markMessageAsRead(messageId, userId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

  // Get user's encryption keys
  app.get('/api/direct-messages/encryption-keys', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user';
      const keys = await storage.getEncryptionKeys(userId);
      res.json(keys);
    } catch (error) {
      console.error('Error fetching encryption keys:', error);
      res.status(500).json({ error: 'Failed to fetch encryption keys' });
    }
  });

  // Create new encryption key
  app.post('/api/direct-messages/encryption-keys', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user';
      const keyData = insertMessageEncryptionKeySchema.parse({
        ...req.body,
        userId
      });
      const key = await storage.createEncryptionKey(keyData);
      res.status(201).json(key);
    } catch (error) {
      console.error('Error creating encryption key:', error);
      res.status(500).json({ error: 'Failed to create encryption key' });
    }
  });

  // Get upload URL for media messages
  app.get('/api/direct-messages/upload-url', async (req, res) => {
    try {
      // In a real implementation, this would generate a secure upload URL
      // For now, return a placeholder that works with the existing object storage
      res.json({ 
        method: 'PUT',
        url: '/api/objects/upload' // This would be a real presigned URL
      });
    } catch (error) {
      console.error('Error generating upload URL:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  });

  // Real-time messaging API endpoints
  app.post('/api/messaging/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = 'demo-user'; // Use demo user for testing
      const conversationData = insertConversationSchema.parse({
        ...req.body,
        participant1Id: userId
      });
      const conversation = await storage.createConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  app.get('/api/messaging/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = 'demo-user'; // Use demo user for testing
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.get('/api/messaging/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const messages = await storage.getConversationMessages(id, parseInt(limit), parseInt(offset));
      res.json(messages);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messaging/encryption-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = 'demo-user'; // Use demo user for testing
      
      // Generate new RSA key pair
      const keyPair = await MessageEncryption.generateKeyPair();
      
      // Encrypt private key with user password (in production, this would be user's password)
      const userPassword = req.body.password || 'default-password'; // Should be user's actual password
      const encryptedPrivateKey = MessageEncryption.encryptPrivateKey(keyPair.privateKey, userPassword);
      
      const keyData = {
        userId,
        publicKey: keyPair.publicKey,
        privateKeyEncrypted: encryptedPrivateKey,
        keyType: 'rsa' as const
      };
      
      const keys = await storage.createUserEncryptionKeys(keyData);
      
      // Return only public key and ID, never send private key
      res.status(201).json({
        id: keys.id,
        userId: keys.userId,
        publicKey: keys.publicKey,
        keyType: keys.keyType,
        isActive: keys.isActive,
        createdAt: keys.createdAt
      });
    } catch (error) {
      console.error('Error creating encryption keys:', error);
      res.status(500).json({ error: 'Failed to create encryption keys' });
    }
  });

  app.get('/api/messaging/encryption-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = 'demo-user'; // Use demo user for testing
      const keys = await storage.getUserEncryptionKeys(userId);
      
      if (!keys) {
        return res.status(404).json({ error: 'No encryption keys found' });
      }
      
      // Return only public key and metadata, never private key
      res.json({
        id: keys.id,
        userId: keys.userId,
        publicKey: keys.publicKey,
        keyType: keys.keyType,
        isActive: keys.isActive,
        createdAt: keys.createdAt
      });
    } catch (error) {
      console.error('Error fetching encryption keys:', error);
      res.status(500).json({ error: 'Failed to fetch encryption keys' });
    }
  });

  app.get('/api/messaging/users/:userId/public-key', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const keys = await storage.getUserEncryptionKeys(userId);
      
      if (!keys) {
        return res.status(404).json({ error: 'User encryption keys not found' });
      }
      
      res.json({
        userId,
        publicKey: keys.publicKey,
        keyType: keys.keyType
      });
    } catch (error) {
      console.error('Error fetching user public key:', error);
      res.status(500).json({ error: 'Failed to fetch public key' });
    }
  });

  app.post('/api/messaging/test-encryption', isAuthenticated, async (req: any, res) => {
    try {
      const { message, recipientUserId } = req.body;
      
      // Get recipient's public key
      const recipientKeys = await storage.getUserEncryptionKeys(recipientUserId);
      if (!recipientKeys) {
        return res.status(404).json({ error: 'Recipient encryption keys not found' });
      }
      
      // Encrypt message
      const encryptedMessage = MessageEncryption.encryptMessage(message, recipientKeys.publicKey);
      
      res.json({
        originalMessage: message,
        encryptedMessage,
        recipientUserId,
        status: 'encryption_successful'
      });
    } catch (error) {
      console.error('Error testing encryption:', error);
      res.status(500).json({ error: 'Encryption test failed' });
    }
  });

  // Admin API routes - Grant admin to current session user
  app.post('/api/admin/grant-admin', async (req: any, res) => {
    try {
      const { adminCode } = req.body;
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Must be logged in to grant admin access' });
      }
      
      // Verify admin code
      if (adminCode !== 'MOSH_ADMIN_2025') {
        return res.status(403).json({ error: 'Invalid admin code' });
      }
      
      // Get current user to check if they're Durantoss
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Only grant full admin to Durantoss
      if (currentUser.stagename === 'Durantoss') {
        await db
          .update(users)
          .set({ 
            isAdmin: true, 
            role: 'admin',
            permissions: { full_admin: true, user_management: true, content_moderation: true, band_management: true, tour_management: true, review_moderation: true, photo_moderation: true, messaging_moderation: true }
          })
          .where(eq(users.id, userId));
      } else {
        return res.status(403).json({ error: 'Only Durantoss can have full admin access. Contact super admin for specific permissions.' });
      }
      
      // Update session to reflect admin status
      req.session.isAdmin = true;
      
      res.json({ success: true, message: 'Admin privileges granted successfully' });
    } catch (error) {
      console.error('Error granting admin:', error);
      res.status(500).json({ error: 'Failed to grant admin privileges' });
    }
  });

  app.get('/api/admin/users', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get current user and check admin status
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Check if user has user management privileges or is the super admin
      const hasUserManagement = currentUser.stagename === 'Durantoss' || 
                                currentUser.permissions?.user_management === true;
      
      if (!hasUserManagement) {
        return res.status(403).json({ error: 'User management privileges required' });
      }

      const allUsers = await db
        .select({
          id: users.id,
          stagename: users.stagename,
          email: users.email,
          role: users.role,
          isAdmin: users.isAdmin,
          permissions: users.permissions,
          isOnline: users.isOnline,
          lastActive: users.lastActive,
          reputationPoints: users.reputationPoints,
          createdAt: users.createdAt
        })
        .from(users)
        .orderBy(users.createdAt);
      
      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.put('/api/admin/users/role', async (req, res) => {
    try {
      const { userId, role } = req.body;
      
      await db
        .update(users)
        .set({ role })
        .where(eq(users.id, userId));
      
      res.json({ success: true, message: 'User role updated' });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  app.put('/api/admin/users/admin', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get current user - only super admin (Durantoss) can grant admin privileges
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.stagename !== 'Durantoss') {
        return res.status(403).json({ error: 'Only super admin can grant admin privileges' });
      }

      const { userId, isAdmin } = req.body;
      
      // Prevent granting full admin to anyone (only Durantoss should have full admin)
      if (isAdmin) {
        return res.status(403).json({ error: 'Full admin access cannot be granted. Use specific permissions instead.' });
      }
      
      await db
        .update(users)
        .set({ 
          isAdmin: false,
          role: 'user',
          permissions: {} // Remove all admin permissions
        })
        .where(eq(users.id, userId));
      
      res.json({ success: true, message: 'Admin privileges revoked' });
    } catch (error) {
      console.error('Error updating admin status:', error);
      res.status(500).json({ error: 'Failed to update admin status' });
    }
  });

  // New route for granting specific admin permissions - only super admin can use this
  app.post('/api/admin/grant-permissions', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get current user - only super admin (Durantoss) can grant permissions
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.stagename !== 'Durantoss') {
        return res.status(403).json({ error: 'Only super admin can grant specific permissions' });
      }

      const { userId, permissions } = req.body;
      
      // Validate permissions - only allow specific ones, never full_admin
      const allowedPermissions = [
        'user_management',
        'content_moderation', 
        'band_management',
        'tour_management',
        'review_moderation',
        'photo_moderation',
        'messaging_moderation'
      ];
      
      const invalidPermissions = Object.keys(permissions).filter(
        perm => !allowedPermissions.includes(perm) || perm === 'full_admin'
      );
      
      if (invalidPermissions.length > 0) {
        return res.status(400).json({ 
          error: `Invalid permissions: ${invalidPermissions.join(', ')}. Only specific privileges can be granted.` 
        });
      }
      
      // Grant the specific permissions (not full admin)
      await db
        .update(users)
        .set({ 
          permissions: permissions,
          role: Object.keys(permissions).length > 0 ? 'moderator' : 'user'
        })
        .where(eq(users.id, userId));
      
      res.json({ 
        success: true, 
        message: 'Specific admin permissions granted',
        permissions: permissions
      });
    } catch (error) {
      console.error('Error granting permissions:', error);
      res.status(500).json({ error: 'Failed to grant permissions' });
    }
  });

  // Chat API Routes
  
  // Get chat messages for a room
  app.get('/api/chat/messages/:roomId', async (req, res) => {
    try {
      const { roomId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const messages = await db
        .select({
          id: chatMessages.id,
          content: chatMessages.content,
          messageType: chatMessages.messageType,
          createdAt: chatMessages.createdAt,
          isEdited: chatMessages.isEdited,
          user: {
            id: users.id,
            stagename: users.stagename,
            profileImageUrl: users.profileImageUrl,
            isOnline: users.isOnline
          }
        })
        .from(chatMessages)
        .innerJoin(users, eq(chatMessages.userId, users.id))
        .where(eq(chatMessages.roomId, roomId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(limit)
        .offset(offset);
      
      res.json(messages.reverse()); // Most recent at bottom
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Send a new chat message
  app.post('/api/chat/messages', requireAuthentication, async (req, res) => {
    try {
      const { content, roomId, messageType = 'text' } = req.body;
      const userId = req.session.userId;
      
      if (!content || !roomId) {
        return res.status(400).json({ error: 'Content and roomId are required' });
      }
      
      // Insert new message
      const [newMessage] = await db
        .insert(chatMessages)
        .values({
          content,
          userId,
          roomId,
          messageType
        })
        .returning();
      
      // Get the complete message with user data
      const messageWithUser = await db
        .select({
          id: chatMessages.id,
          content: chatMessages.content,
          messageType: chatMessages.messageType,
          createdAt: chatMessages.createdAt,
          isEdited: chatMessages.isEdited,
          user: {
            id: users.id,
            stagename: users.stagename,
            profileImageUrl: users.profileImageUrl,
            isOnline: users.isOnline
          }
        })
        .from(chatMessages)
        .innerJoin(users, eq(chatMessages.userId, users.id))
        .where(eq(chatMessages.id, newMessage.id))
        .limit(1);
      
      const fullMessage = messageWithUser[0];
      
      // Broadcast to WebSocket clients
      if (global.chatWebSocketServer) {
        global.chatWebSocketServer.broadcast(roomId, {
          type: 'new_message',
          message: fullMessage
        });
      }
      
      res.status(201).json(fullMessage);
    } catch (error) {
      console.error('Error sending chat message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Get available chat rooms
  app.get('/api/chat/rooms', async (req, res) => {
    try {
      const rooms = await db
        .select()
        .from(chatRooms)
        .where(eq(chatRooms.isActive, true))
        .orderBy(chatRooms.name);
      
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ error: 'Failed to fetch chat rooms' });
    }
  });

  // Get online users in a chat room
  app.get('/api/chat/rooms/:roomId/users', async (req, res) => {
    try {
      const { roomId } = req.params;
      
      const onlineUsers = await db
        .select({
          id: users.id,
          stagename: users.stagename,
          profileImageUrl: users.profileImageUrl,
          isOnline: users.isOnline,
          lastSeen: chatParticipants.lastSeen
        })
        .from(chatParticipants)
        .innerJoin(users, eq(chatParticipants.userId, users.id))
        .where(
          and(
            eq(chatParticipants.roomId, roomId),
            eq(chatParticipants.isOnline, true)
          )
        )
        .orderBy(desc(chatParticipants.lastSeen));
      
      res.json(onlineUsers);
    } catch (error) {
      console.error('Error fetching online users:', error);
      res.status(500).json({ error: 'Failed to fetch online users' });
    }
  });

  // Create HTTP server and setup WebSocket
  const httpServer = createServer(app);
  
  // Initialize WebSocket server for real-time messaging  
  const wsServer = new MessagingWebSocketServer(httpServer);
  console.log('WebSocket server initialized for real-time messaging');
  
  // Initialize Chat WebSocket Server for live chat
  const { ChatWebSocketServer } = await import('./chatWebSocket');
  (global as any).chatWebSocketServer = new ChatWebSocketServer(httpServer);
  console.log('Chat WebSocket server initialized for live chat');
  
  return httpServer;
}
