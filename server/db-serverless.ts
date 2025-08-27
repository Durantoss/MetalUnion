import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Global connection cache for serverless functions
let cachedDb: ReturnType<typeof drizzle> | null = null;

export function getServerlessDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('Creating new serverless database connection');
  
  // Create Neon HTTP client for serverless environments
  const sql = neon(databaseUrl);
  
  // Create Drizzle instance with schema
  cachedDb = drizzle(sql, { schema });
  
  return cachedDb;
}

// Export the database instance
export const db = getServerlessDb();
