// Run this script to add the is_guest column to the users table
import { db, pool } from '../db';
import { sql } from 'drizzle-orm';

async function migrateDb() {
  console.log('Running database migration...');
  
  try {
    // Check if column exists
    const checkColumnQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_guest'
    `;
    
    const columnExists = await db.execute(checkColumnQuery);
    
    if (!columnExists.rows || columnExists.rows.length === 0) {
      console.log('Adding is_guest column to users table...');
      
      // Add the is_guest column
      const addColumnQuery = sql`
        ALTER TABLE users 
        ADD COLUMN is_guest BOOLEAN DEFAULT FALSE
      `;
      
      await db.execute(addColumnQuery);
      console.log('Column added successfully!');
    } else {
      console.log('Column is_guest already exists. No migration needed.');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

migrateDb();