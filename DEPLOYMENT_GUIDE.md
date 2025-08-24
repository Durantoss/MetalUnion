# MetalUnion Deployment Guide: Supabase + Vercel

This guide will walk you through deploying your MetalUnion app using Supabase for the database and Vercel for hosting.

## Prerequisites

- Node.js 18+ installed
- Git repository set up
- Supabase account
- Vercel account

## Phase 1: Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `metalunion-db`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., US East for North America)
4. Click "Create new project"
5. Wait for the project to be created (2-3 minutes)

### Step 2: Get Database Connection Details

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Copy the connection string under "Connection string" → "URI"
3. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 3: Set Up Database Schema

Since your app has a complex schema with 40+ tables, we'll use the SQL editor:

1. In Supabase dashboard, go to **SQL Editor**
2. We'll need to convert your Drizzle schema to SQL. I'll create a migration script for you.

### Step 4: Configure Row Level Security (RLS)

For production security, we'll set up RLS policies for your tables.

## Phase 2: Update Your Application

### Step 1: Update Environment Variables

Update your `.env` file:

```env
# Supabase Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Other existing variables
OPENAI_API_KEY="your-actual-openai-api-key"
```

### Step 2: Install Supabase Client (Optional)

If you want to use Supabase's additional features:

```bash
npm install @supabase/supabase-js
```

## Phase 3: Vercel Deployment Setup

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Prepare Your Project

Your project structure is already good for Vercel, but we need some configuration files.

### Step 3: Configure Build Settings

I'll create the necessary configuration files for you.

### Step 4: Deploy to Vercel

1. Run `vercel` in your project root
2. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N** (first time)
   - Project name: `metalunion`
   - In which directory is your code located? `./`
3. Set up environment variables in Vercel dashboard

## Phase 4: Production Configuration

### Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all your environment variables:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`

### Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS settings as instructed

## Phase 5: Testing and Optimization

### Database Connection Testing

Test your database connection in production:

1. Check the `/health` endpoint
2. Verify user registration/login works
3. Test core app functionality

### Performance Monitoring

1. Monitor Vercel function execution times
2. Check Supabase database performance
3. Set up error tracking (optional: Sentry integration)

## Troubleshooting

### Common Issues

1. **Database Connection Timeout**: Increase connection timeout in your database config
2. **CORS Issues**: Check your CORS configuration in the server
3. **Build Failures**: Ensure all dependencies are in `package.json`
4. **Environment Variables**: Double-check all env vars are set in Vercel

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Drizzle ORM with Supabase](https://orm.drizzle.team/docs/get-started-postgresql#supabase)

## Security Checklist

- [ ] Database password is strong and secure
- [ ] Environment variables are properly set
- [ ] RLS policies are configured
- [ ] CORS is properly configured
- [ ] API rate limiting is enabled
- [ ] Authentication is working correctly

## Next Steps After Deployment

1. Set up monitoring and alerts
2. Configure automated backups
3. Set up staging environment
4. Implement CI/CD pipeline
5. Add performance monitoring

---

**Need Help?** If you encounter any issues during deployment, check the troubleshooting section or refer to the official documentation links provided above.
