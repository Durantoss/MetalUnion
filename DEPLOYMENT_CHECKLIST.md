# MetalUnion Deployment Checklist

Use this checklist to ensure a successful deployment to Supabase + Vercel.

## Pre-Deployment Setup

### 1. Supabase Setup
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project named `metalunion-db`
- [ ] Choose appropriate region (closest to your users)
- [ ] Save database password securely
- [ ] Copy project reference ID from URL
- [ ] Get connection string from Settings → Database
- [ ] Get API keys from Settings → API:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Migration
- [ ] Open Supabase SQL Editor
- [ ] Copy contents of `supabase-migration.sql`
- [ ] Execute the migration script
- [ ] Verify all tables were created successfully
- [ ] Check that indexes are in place
- [ ] Confirm RLS policies are active

### 3. Environment Variables Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all Supabase credentials
- [ ] Generate strong `SESSION_SECRET` (use: `openssl rand -base64 32`)
- [ ] Add your `OPENAI_API_KEY`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGINS` with your domain

### 4. Vercel Setup
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Connect your GitHub repository to Vercel
- [ ] Import project to Vercel

## Deployment Process

### 1. Local Testing
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run check` to verify TypeScript compilation
- [ ] Test database connection with new Supabase URL
- [ ] Run `npm run build` to test production build
- [ ] Verify all environment variables are set

### 2. Vercel Configuration
- [ ] Verify `vercel.json` is in project root
- [ ] Check build commands in `package.json`
- [ ] Ensure all required files are included in git

### 3. Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
- [ ] `DATABASE_URL` - Your Supabase connection string
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `SESSION_SECRET` - Strong random string for sessions
- [ ] `NODE_ENV` - Set to `production`
- [ ] `OPENAI_API_KEY` - Your OpenAI API key

**Optional Variables:**
- [ ] `CORS_ORIGINS` - Comma-separated list of allowed origins
- [ ] `SENTRY_DSN` - For error tracking
- [ ] `GA_TRACKING_ID` - For analytics

### 4. Deploy to Vercel
- [ ] Run `vercel --prod` or deploy via GitHub integration
- [ ] Wait for build to complete
- [ ] Check build logs for any errors
- [ ] Verify deployment URL is accessible

## Post-Deployment Verification

### 1. Basic Functionality
- [ ] Visit your deployed app URL
- [ ] Check that the homepage loads correctly
- [ ] Verify API endpoints respond (check `/health`)
- [ ] Test user registration/login flow
- [ ] Confirm database operations work

### 2. Security Checks
- [ ] Verify HTTPS is working
- [ ] Check CORS headers are correct
- [ ] Confirm rate limiting is active
- [ ] Test that sensitive data is not exposed
- [ ] Verify RLS policies are enforcing security

### 3. Performance Testing
- [ ] Check page load times
- [ ] Verify API response times
- [ ] Test with multiple concurrent users
- [ ] Monitor database connection usage
- [ ] Check Vercel function execution times

### 4. Feature Testing
- [ ] User authentication works
- [ ] Band creation/editing functions
- [ ] Review posting works
- [ ] Photo uploads function (if implemented)
- [ ] Search functionality works
- [ ] Real-time features work (if implemented)

## Monitoring Setup

### 1. Vercel Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up function monitoring
- [ ] Configure error alerts
- [ ] Monitor bandwidth usage

### 2. Supabase Monitoring
- [ ] Check database usage metrics
- [ ] Monitor connection pool usage
- [ ] Set up database alerts
- [ ] Review query performance

### 3. Error Tracking (Optional)
- [ ] Set up Sentry for error tracking
- [ ] Configure error alerts
- [ ] Test error reporting

## Domain Setup (Optional)

### 1. Custom Domain
- [ ] Purchase domain name
- [ ] Add domain in Vercel dashboard
- [ ] Configure DNS settings
- [ ] Verify SSL certificate

### 2. DNS Configuration
- [ ] Add A record pointing to Vercel
- [ ] Add CNAME for www subdomain
- [ ] Update CORS_ORIGINS with new domain
- [ ] Test domain accessibility

## Backup and Recovery

### 1. Database Backups
- [ ] Enable Supabase automatic backups
- [ ] Test backup restoration process
- [ ] Document backup procedures

### 2. Code Backups
- [ ] Ensure code is in version control
- [ ] Tag production releases
- [ ] Document rollback procedures

## Performance Optimization

### 1. Database Optimization
- [ ] Review and optimize slow queries
- [ ] Ensure proper indexing
- [ ] Monitor connection pool usage
- [ ] Set up query caching if needed

### 2. Frontend Optimization
- [ ] Enable Vercel Edge caching
- [ ] Optimize images and assets
- [ ] Implement code splitting
- [ ] Monitor Core Web Vitals

## Security Hardening

### 1. Database Security
- [ ] Review RLS policies
- [ ] Audit user permissions
- [ ] Enable audit logging
- [ ] Regular security updates

### 2. Application Security
- [ ] Review CORS configuration
- [ ] Audit API endpoints
- [ ] Implement rate limiting
- [ ] Regular dependency updates

## Maintenance Tasks

### Weekly
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Review security alerts
- [ ] Update dependencies if needed

### Monthly
- [ ] Review database performance
- [ ] Audit user activity
- [ ] Check backup integrity
- [ ] Performance optimization review

## Troubleshooting Common Issues

### Build Failures
- Check TypeScript compilation errors
- Verify all dependencies are installed
- Check environment variables are set
- Review build logs in Vercel

### Database Connection Issues
- Verify connection string format
- Check Supabase project status
- Confirm SSL settings
- Test connection from local environment

### CORS Errors
- Check CORS_ORIGINS environment variable
- Verify domain spelling
- Confirm protocol (http vs https)
- Test with browser dev tools

### Performance Issues
- Monitor Vercel function execution times
- Check database query performance
- Review network requests
- Optimize large assets

---

## Emergency Contacts

- **Supabase Support**: [support@supabase.com](mailto:support@supabase.com)
- **Vercel Support**: [support@vercel.com](mailto:support@vercel.com)
- **Project Repository**: [Your GitHub Repo URL]

## Success Criteria

Your deployment is successful when:
- [ ] App loads without errors
- [ ] Users can register and login
- [ ] Core features work as expected
- [ ] Performance meets requirements
- [ ] Security measures are active
- [ ] Monitoring is in place

**Congratulations! Your MetalUnion app is now live! 🎸🤘**
