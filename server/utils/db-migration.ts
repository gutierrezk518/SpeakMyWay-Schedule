import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Script to add admin-related columns and tables to the database
 */
async function runMigration() {
  console.log('Starting database migration for admin features...');
  
  try {
    // 1. Add isAdmin, lastLogin, and lastLoginIp columns to users table
    console.log('Adding admin columns to users table...');
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_login_ip TEXT;
    `);
    
    // 2. Create user_login_history table
    console.log('Creating user_login_history table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_login_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        login_time TIMESTAMP DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT,
        device TEXT,
        browser TEXT,
        success BOOLEAN DEFAULT TRUE
      );
    `);
    
    // 3. Create password_reset_tokens table
    console.log('Creating password_reset_tokens table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        expires TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Export the migration function
export { runMigration };