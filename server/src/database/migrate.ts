import db from './db.js';

/**
 * Run database migrations
 */
export const runMigrations = () => {
  try {
    // Check if username column exists
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const hasUsername = tableInfo.some((col: any) => col.name === 'username');
    
    if (!hasUsername) {
      console.log('🔄 Running migration: Adding username column...');
      
      // Add username column
      db.exec('ALTER TABLE users ADD COLUMN username TEXT');
      
      // Create unique index
      try {
        db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)');
        console.log('✅ Username column and index created successfully');
      } catch (idxError: any) {
        // If there are existing NULL values, we can't create unique index yet
        console.warn('⚠️  Could not create unique index (may have NULL values):', idxError.message);
        // Update NULL values to empty string temporarily
        db.exec("UPDATE users SET username = '' WHERE username IS NULL");
        // Try again
        try {
          db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)');
          console.log('✅ Username index created after cleanup');
        } catch (e) {
          console.warn('⚠️  Index creation failed, but column exists');
        }
      }
    } else {
      console.log('✅ Username column already exists');
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

