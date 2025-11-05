import pkg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection string
const connectionString = 'postgres://postgres:X-pp-db-dev-3b7df01f@34.87.140.88:5432/postgres';

async function resetDatabase() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    console.log('🗑️  Dropping all tables...');
    
    // Drop all tables
    const dropTablesQuery = `
      DO $$ DECLARE
        r RECORD;
      BEGIN
        -- Disable triggers
        SET session_replication_role = 'replica';
        
        -- Drop all tables
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          RAISE NOTICE 'Dropped table: %', r.tablename;
        END LOOP;
        
        -- Re-enable triggers
        SET session_replication_role = 'origin';
      END $$;
    `;
    
    await client.query(dropTablesQuery);
    console.log('✅ All tables dropped successfully\n');
    
    console.log('📝 Creating tables from init.sql...');
    
    // Read and execute init.sql
    const initSQL = readFileSync(join(__dirname, 'init.sql'), 'utf8');
    await client.query(initSQL);
    
    console.log('✅ Database reset complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
