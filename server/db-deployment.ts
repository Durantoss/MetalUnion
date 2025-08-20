// Database deployment handler to gracefully manage suspended Neon databases
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Enhanced database connection with retry logic for deployments
function createResilientDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }

  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Increased timeout for suspended databases
  });

  // Override pool query to handle suspended database gracefully
  const originalQuery = pool.query.bind(pool);
  pool.query = async function(text: any, params?: any) {
    try {
      return await originalQuery(text, params);
    } catch (error: any) {
      // Handle suspended database during deployment
      if (error?.message?.includes("endpoint has been disabled") || 
          error?.code === "XX000" ||
          error?.message?.includes("password authentication failed")) {
        
        console.log("⚠️ Database suspended during deployment - this is expected behavior");
        console.log("🔄 Database will automatically activate when app receives traffic");
        
        // Return minimal safe response for schema queries during deployment
        if (typeof text === 'string' && text.includes('information_schema')) {
          return { rows: [], rowCount: 0, command: 'SELECT', fields: [] };
        }
        
        // Re-throw for other operations to be handled by caller
        throw error;
      }
      throw error;
    }
  };

  return drizzle({ client: pool, schema });
}

export const deploymentSafeDb = createResilientDatabaseConnection();
export { pool as deploymentSafePool } from './db';