const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Use environment variable or build connection string
const connectionString = process.env.DATABASE_URL || 
  'postgres://sarthak:sarthak123@servercampaign-db:5432/servercampaign';

// Create pool with increased max clients for concurrent requests
const pool = new Pool({ 
  connectionString,
  max: 20, // Support more concurrent connections
  idleTimeoutMillis: 30000 // Close idle clients after 30 seconds
});

// Track initialization state
let isInitializing = false;
let isInitialized = false;

// Initialize database once at startup
const initializeDb = async () => {
  // Prevent concurrent initializations
  if (isInitializing || isInitialized) return;
  
  isInitializing = true;
  
  try {
    console.log('Checking if database table exists...');
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'responses'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('Database table already exists');
      isInitialized = true;
      isInitializing = false;
      return;
    }

    console.log('Creating database table...');
    // Create table in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Drop sequence if it exists but table doesn't (fixes corruption)
      await client.query(`
        DROP SEQUENCE IF EXISTS responses_id_seq CASCADE;
      `);
      
      // Create the table
      await client.query(`
        CREATE TABLE IF NOT EXISTS responses (
          id SERIAL PRIMARY KEY,
          campaign_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          landing_page_id INTEGER NOT NULL,
          ip_address VARCHAR(50) NOT NULL,
          response_text TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await client.query('COMMIT');
      isInitialized = true;
      console.log('Database table created successfully');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Failed to create database table:', err);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  } finally {
    isInitializing = false;
  }
};

// Error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize immediately on module load
console.log('Initializing database...');
initializeDb().then(() => {
  console.log('Database initialization complete');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Export pool for use in other modules
module.exports = pool;