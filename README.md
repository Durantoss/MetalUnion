# MetalUnion 🎸🤘

A comprehensive social platform for the metal music community, built with React, TypeScript, Express.js, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your values
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## 📦 Deployment to Supabase + Vercel

This project is configured for easy deployment using Supabase (database) and Vercel (hosting).

### Automated Deployment

**For Windows:**
```bash
scripts/deploy.bat
```

**For macOS/Linux:**
```bash
scripts/deploy.sh
```

### Manual Deployment

Follow the detailed guides:
- 📖 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete step-by-step instructions
- ✅ **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Comprehensive deployment checklist

## 🏗️ Project Structure

```
MetalUnion/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── server/                 # Express.js backend
│   ├── routes.ts           # API routes
│   ├── auth.ts             # Authentication
│   ├── db.ts               # Database connection
│   └── production-config.ts # Production settings
├── shared/                 # Shared code
│   └── schema.ts           # Database schema (Drizzle ORM)
├── scripts/                # Deployment scripts
│   ├── deploy.sh           # Unix deployment script
│   └── deploy.bat          # Windows deployment script
├── supabase-migration.sql  # Database migration script
├── vercel.json             # Vercel configuration
├── .env.example            # Environment variables template
└── deployment files...     # Guides and checklists
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Framer Motion** - Animations
- **React Query** - Data fetching

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Passport.js** - Authentication
- **Express Session** - Session management
- **Helmet** - Security headers

### Database
- **PostgreSQL** - Primary database
- **Supabase** - Database hosting and management
- **40+ tables** - Comprehensive schema for social features

### Deployment
- **Vercel** - Frontend and serverless functions hosting
- **Supabase** - Database hosting
- **GitHub** - Version control and CI/CD

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run dev:client` - Start only frontend dev server
- `npm run start:dev` - Start both frontend and backend

### Building
- `npm run build` - Build both frontend and backend
- `npm run build:client` - Build only frontend
- `npm run build:server` - Build only backend
- `npm run build:vercel` - Build for Vercel deployment

### Database
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Deployment
- `npm run deploy` - Deploy to production
- `npm run deploy:preview` - Deploy preview version
- `scripts/deploy.bat` - Windows deployment script
- `scripts/deploy.sh` - Unix deployment script

### Other
- `npm run check` - TypeScript type checking
- `npm run preview` - Preview production build locally

## 🌟 Features

### Core Features
- **User Authentication** - Secure registration and login
- **User Profiles** - Customizable profiles with stagenames
- **Band Database** - Comprehensive band information
- **Reviews & Ratings** - Detailed review system
- **Photo Galleries** - Band and concert photos
- **Tour Information** - Concert dates and venues

### Social Features
- **Community Posts** - Share thoughts and discussions
- **Comments System** - Threaded comments on all content
- **Following System** - Follow other users
- **Activity Feed** - See what friends are up to
- **Notifications** - Real-time notifications
- **Direct Messaging** - Private conversations

### Advanced Features
- **Gamification** - Badges and reputation system
- **Proximity Matching** - Find metalheads at concerts
- **Event Organization** - Create and join meetups
- **Polls & Voting** - Community polls
- **Mentorship System** - Connect experienced with newcomers
- **Live Chat Rooms** - Real-time group discussions

### Security Features
- **End-to-End Encryption** - Secure messaging
- **Row Level Security** - Database-level security
- **Rate Limiting** - API protection
- **CORS Protection** - Cross-origin security
- **Session Management** - Secure authentication

## 🔒 Environment Variables

Copy `.env.example` to `.env` and configure:

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `NODE_ENV` - Environment (development/production)

### Supabase (for production)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Optional
- `OPENAI_API_KEY` - For AI features
- `CORS_ORIGINS` - Allowed origins for CORS
- `SENTRY_DSN` - Error tracking
- `GA_TRACKING_ID` - Google Analytics

## 🚀 Deployment Options

### 1. Supabase + Vercel (Recommended)
- **Database**: Supabase PostgreSQL
- **Hosting**: Vercel serverless functions
- **CDN**: Vercel Edge Network
- **SSL**: Automatic HTTPS

### 2. Self-Hosted
- Any PostgreSQL database
- Any Node.js hosting provider
- Manual SSL configuration required

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with 40+ tables:

### Core Tables
- `users` - User accounts and profiles
- `bands` - Band information
- `reviews` - User reviews
- `photos` - Image galleries
- `tours` - Concert information

### Social Tables
- `posts` - Community posts
- `comments` - Comment system
- `user_follows` - Following relationships
- `notifications` - User notifications
- `direct_messages` - Private messaging

### Advanced Tables
- `badges` - Gamification system
- `user_locations` - Proximity features
- `events` - Community events
- `polls` - Voting system
- `mentorships` - Mentorship program

## 🔧 Configuration

### Production Security
- HTTPS enforced
- CORS properly configured
- Rate limiting enabled
- Security headers set
- Row Level Security (RLS) enabled

### Performance
- Connection pooling
- Query optimization
- CDN integration
- Image optimization
- Code splitting

## 📈 Monitoring

### Built-in Health Checks
- Database connectivity
- Memory usage
- Uptime monitoring
- API response times

### Recommended Monitoring
- **Vercel Analytics** - Performance metrics
- **Supabase Metrics** - Database monitoring
- **Sentry** - Error tracking
- **Google Analytics** - User analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

### Community
- GitHub Issues for bug reports
- GitHub Discussions for questions

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

---

**Built with ❤️ for the metal community** 🎸🤘

*Ready to deploy? Run `scripts/deploy.bat` (Windows) or `scripts/deploy.sh` (Unix) to get started!*
