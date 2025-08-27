# Supabase Deployment Requirements for MoshUnion

## Critical Steps Required in Supabase

### 1. Execute Database Migration Script
**MOST IMPORTANT STEP** - Your database is currently empty and needs all tables created.

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your MoshUnion project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy the entire contents of `supabase-migration-final.sql` (the final clean version with proper UUID types and all RLS fixes)
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration
7. Verify success - you should see: "MetalUnion database schema created successfully with UUID types and all RLS policies fixed!"

### 1.1. Apply UUID Fix (If Needed)
**If you encounter UUID type errors with the sessions table:**

1. In the same **SQL Editor** in Supabase
2. Copy the entire contents of `supabase-sessions-uuid-fix.sql`
3. Paste it into a new SQL Editor tab
4. Click **Run** to execute the UUID fix
5. Verify success - you should see: "Sessions table UUID type and RLS policies fixed successfully!"

### 2. Get Your Environment Variables
You need these values for Vercel deployment:

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (for VITE_SUPABASE_URL)
   - **anon public** key (for VITE_SUPABASE_ANON_KEY)

### 3. Configure Authentication (Optional but Recommended)
1. Go to **Authentication** → **Settings**
2. Configure allowed domains:
   - Add `moshunion.rocks`
   - Add `*.vercel.app` (for preview deployments)
3. Set up email templates if needed

### 4. Set Up Row Level Security (Already Done)
✅ The migration script already enables RLS and creates all necessary policies

### 5. Configure Storage (If Using File Uploads)
1. Go to **Storage** in Supabase Dashboard
2. Create buckets for:
   - `profile-images`
   - `band-photos`
   - `user-uploads`
3. Set appropriate policies for each bucket

## Next Steps After Supabase Setup

### 1. Set Environment Variables in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 2. Trigger Deployment
1. Push any small change to GitHub (or redeploy in Vercel)
2. Vercel will automatically deploy with new environment variables

### 3. Test Your Deployment
1. Visit your deployed site
2. Test user registration/login
3. Verify database connections work

## Database Schema Overview
The migration creates these key tables:
- `users` - User profiles and authentication
- `bands` - Band information
- `tours` - Concert/tour data
- `reviews` - User reviews
- `posts` - Community posts
- `direct_messages` - Encrypted messaging
- `notifications` - User notifications
- Plus 20+ other tables for full functionality

## Security Features Included
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ User-specific data access policies
- ✅ Public read access for community content
- ✅ Encrypted messaging support
- ✅ Admin role permissions

## Troubleshooting
If you encounter errors during migration:
1. Check for any existing tables that might conflict
2. Ensure you're using the `supabase-migration-uuid.sql` file (latest version with UUID types and fixed RLS policies)
3. Run the script in sections if needed
4. The script includes fixes for direct_messages RLS policies that were referencing non-existent columns
5. Contact support if RLS policies still fail

## Status Check
After completing these steps, your deployment should work with:
- ✅ Database tables created
- ✅ RLS policies active
- ✅ Environment variables set
- ✅ Authentication configured
- ✅ Frontend deployed to Vercel
