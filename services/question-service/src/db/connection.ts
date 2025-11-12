import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config'  // loads .env

// Connection using DATABASE environment variable with SSL
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
});
