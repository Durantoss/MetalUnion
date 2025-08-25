import { createClient } from '@supabase/supabase-js'

// Use hardcoded values for development since we're removing restrictions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jxrkgdqhynesvdnbhgzu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cmtnZHFoeW5lc3ZkbmJoZ3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzIzNzksImV4cCI6MjA3MTY0ODM3OX0.fSCXA1ZpIOswUPmdhn3O0wh7iIKtcxkZTlMiHlDHCCs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
