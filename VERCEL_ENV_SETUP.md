# Vercel Environment Variables Setup

## Quick Setup Guide

### 1. Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Navigate to your project
3. Go to **Settings** → **Environment Variables**

### 2. Add Required Variables

#### DATABASE_URL (Required)
- **Name:** `DATABASE_URL`
- **Value:** `postgresql://postgres:GeigerBomba11@db.jxrkgdqhynesvdnbhgzu.supabase.co:5432/postgres`

**Note:** This connection string is configured for your specific Supabase project. The password and database details are already included.

#### SUPABASE_URL (Required)
- **Name:** `SUPABASE_URL`
- **Value:** `https://jxrkgdqhynesvdnbhgzu.supabase.co`

#### SUPABASE_ANON_KEY (Required)
- **Name:** `SUPABASE_ANON_KEY`
- **Value:** Your Supabase anonymous key

**To get your Supabase keys:**
1. Go to your Supabase project dashboard
2. Settings → API → Project API keys
3. Copy the `anon` `public` key

### 3. Optional Variables

#### GOOGLE_API_KEY (Optional)
- **Name:** `GOOGLE_API_KEY`
- **Value:** Your Google API key (for search functionality)

#### OPENAI_API_KEY (Optional)
- **Name:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key (for AI features)

### 4. Environment Settings
For each variable, set the environment to:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### 5. Deploy
After adding all environment variables, redeploy your application:
```bash
vercel --prod
```

## Verification
After deployment, test your API endpoints:
- Health check: `https://your-app.vercel.app/api/health`
- Bands endpoint: `https://your-app.vercel.app/api/bands`

## Troubleshooting
- If you get database connection errors, double-check your DATABASE_URL format
- Ensure your Supabase project allows connections from Vercel's IP ranges
- Check Vercel function logs for detailed error messages
