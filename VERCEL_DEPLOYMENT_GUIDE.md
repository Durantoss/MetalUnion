# Vercel Deployment Guide for MoshUnion

## Overview
This guide explains how to deploy your full-stack MoshUnion application to Vercel with both frontend and backend functionality.

## Architecture Changes Made

### 1. Updated `vercel.json`
- **FIXED**: Removed conflicting `builds` property that was causing deployment errors
- Configured for full-stack deployment with serverless functions only
- Set up proper routing for API endpoints and static files using `rewrites`
- Added CORS headers and security configurations
- Configured environment variables and build commands

### 2. Created Serverless Function Structure
- `api/index.js` - Main serverless function that handles all API routes
- Routes all `/api/*` requests to your Express.js application
- Maintains your existing route structure and middleware

### 3. Updated Build Process
- Modified package.json scripts for Vercel compatibility
- Added `vercel-build` script for proper client building
- Configured static file serving from `client/dist`

### 4. Database Configuration
- Created `server/db-serverless.ts` for serverless-compatible database connections
- Uses Neon HTTP client for better serverless performance
- Implements connection caching to reduce cold start times

## Environment Variables Setup

Before deploying, you need to configure these environment variables in your Vercel dashboard:

### Required Variables
```bash
DATABASE_URL=your_full_postgresql_connection_string
SUPABASE_URL=https://jxrkgdqhynesvdnbhgzu.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important Note about DATABASE_URL:**
The DATABASE_URL should be your full PostgreSQL connection string, typically in this format:
```
postgresql://username:password@host:port/database?sslmode=require
```

If you're using Supabase for your database, you can find the full connection string in:
1. Supabase Dashboard → Settings → Database → Connection string → URI
2. It should look like: `postgresql://postgres:[password]@db.jxrkgdqhynesvdnbhgzu.supabase.co:5432/postgres`

### Optional Variables (for enhanced features)
```bash
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set Environment Variables
In your Vercel dashboard or via CLI:
```bash
vercel env add DATABASE_URL
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

### 4. Deploy
```bash
vercel --prod
```

## Important Notes

### WebSocket Limitations
Vercel serverless functions have limitations with WebSocket connections. Your real-time features may need adjustments:

- Chat functionality will work but may have reduced real-time capabilities
- Consider using Vercel's Edge Functions for better real-time support
- Alternative: Use external WebSocket services like Pusher or Socket.io with Redis

### Cold Starts
- First request to serverless functions may be slower (cold start)
- Database connection caching helps reduce this impact
- Consider implementing warming strategies for production

### File Uploads
- Current file upload functionality may need adjustment for serverless
- Consider using Vercel's blob storage or external services like AWS S3

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure all dependencies are in `dependencies` not `devDependencies`
   - Check that TypeScript files are properly compiled

2. **Database Connection Issues**
   - Verify DATABASE_URL is correctly set
   - Ensure your Neon database allows connections from Vercel

3. **API Route Not Found**
   - Check that `api/index.js` is properly created
   - Verify routing configuration in `vercel.json`

4. **CORS Issues**
   - CORS headers are configured in both `vercel.json` and `api/index.js`
   - Adjust origins if needed for your domain

### Monitoring
- Use Vercel's dashboard to monitor function performance
- Check function logs for debugging
- Monitor database connection usage

## Next Steps

1. Deploy and test all functionality
2. Set up custom domain if needed
3. Configure monitoring and analytics
4. Optimize for production performance
5. Set up CI/CD pipeline if desired

## Support
If you encounter issues, check:
- Vercel documentation for serverless functions
- Your database provider's serverless connection guides
- Function logs in Vercel dashboard
