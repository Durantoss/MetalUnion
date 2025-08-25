# Netlify Deployment Guide for MetalUnion

## Overview
This guide covers deploying your MetalUnion React app to Netlify as a static site with Supabase backend integration.

## Prerequisites
- GitHub repository with your code
- Netlify account (free tier available)
- Supabase project already configured

## Deployment Steps

### 1. Connect GitHub Repository to Netlify

1. **Login to Netlify**
   - Go to https://netlify.com
   - Sign up/login with your GitHub account

2. **Import Project**
   - Click "New site from Git"
   - Choose "GitHub" as your Git provider
   - Select your `MetalUnion` repository
   - Choose the `main` branch

### 2. Configure Build Settings

Netlify should automatically detect the `netlify.toml` configuration, but verify these settings:

- **Build command**: `npm run build:client`
- **Publish directory**: `dist/public`
- **Node.js version**: 18

### 3. Environment Variables

Add these environment variables in Netlify dashboard (Site settings → Environment variables):

```
DATABASE_URL=postgresql://postgres:GeigerBomba11@db.jxrkgdqhynesvdnbhgzu.supabase.co:5432/postgres
SUPABASE_URL=https://jxrkgdqhynesvdnbhgzu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
```

### 4. Deploy

1. Click "Deploy site"
2. Netlify will automatically build and deploy your app
3. You'll get a random URL like `https://amazing-name-123456.netlify.app`

### 5. Custom Domain Setup (moshunion.rocks)

1. **In Netlify Dashboard**:
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter `moshunion.rocks`
   - Follow the DNS configuration instructions

2. **DNS Configuration**:
   - Add CNAME record: `www` → `your-site-name.netlify.app`
   - Add A record: `@` → Netlify's IP addresses (provided in dashboard)

## Configuration Files

### netlify.toml
```toml
[build]
  command = "npm run build:client"
  publish = "dist/public"
  
  [build.environment]
    NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Advantages Over Vercel

1. **Better Build Reliability**: No PostCSS dependency issues
2. **Clearer Error Messages**: Easier debugging
3. **Simpler Configuration**: Less complex setup
4. **Better Static Site Handling**: Optimized for React SPAs
5. **Excellent Performance**: Built-in CDN and optimization

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify environment variables are set
- Ensure `npm run build:client` works locally

### App Shows Blank Page
- Check browser console for errors
- Verify environment variables are correct
- Check if Supabase URLs are accessible

### Routing Issues
- Ensure `netlify.toml` has the SPA redirect rule
- Check that React Router is configured correctly

## Monitoring

- **Build Status**: Monitor in Netlify dashboard
- **Performance**: Use Netlify Analytics
- **Errors**: Check browser console and Netlify function logs

## Next Steps

1. **Backend Integration**: Consider Netlify Functions for API endpoints
2. **Form Handling**: Use Netlify Forms for contact forms
3. **A/B Testing**: Use Netlify's split testing features
4. **Performance**: Enable Netlify's asset optimization

## Support

- Netlify Documentation: https://docs.netlify.com
- Netlify Community: https://community.netlify.com
- Supabase Documentation: https://supabase.com/docs
