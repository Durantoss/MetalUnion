#!/usr/bin/env node

// Simple utility to wake up a suspended Neon database before deployment
import { Pool } from '@neondatabase/serverless';

console.log('🔄 Attempting to wake up Neon database...');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found. Please ensure database is provisioned.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 10000,
});

async function wakeDatabase() {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`📡 Attempt ${attempts}/${maxAttempts}: Pinging database...`);
    
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT 1 as ping, NOW() as timestamp');
      client.release();
      
      console.log('✅ Database is now active and responding!');
      console.log(`🕒 Server time: ${result.rows[0].timestamp}`);
      console.log('🚀 You can now deploy your application.');
      
      await pool.end();
      process.exit(0);
      
    } catch (error) {
      console.log(`⚠️ Attempt ${attempts} failed: ${error.message}`);
      
      if (error.message.includes('endpoint has been disabled')) {
        console.log('📝 Database is suspended. Waiting 3 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else if (error.message.includes('password authentication failed')) {
        console.log('📝 Connection pool warming up. Waiting 2 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));  
      } else {
        console.error(`❌ Unexpected error: ${error.message}`);
        break;
      }
    }
  }
  
  console.log('❌ Failed to wake database after all attempts.');
  console.log('💡 Try running this script again in a few seconds.');
  console.log('💡 Or deploy anyway - the database will wake up automatically when users visit your app.');
  process.exit(1);
}

wakeDatabase().catch(console.error);