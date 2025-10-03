import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

// Test database connection first
export const db = new Pool({
  user: "username",
  host: "localhost", 
  database: "auth-db",
  password: "password",
  port: 5433,
});

// Function to initialize the database and create tables if they don't exist
export async function initializeDatabase() {
  const client = await db.connect();
  try {
    console.log("Initializing database...");
    
    // Read and execute SQL file
    const sqlFilePath = join(__dirname, "db.sql");
    const sqlContent = readFileSync(sqlFilePath, "utf8");
    const commands = sqlContent.split(';').map(e => e + ';')
    
    for (const command of commands) {
      await client.query(command);
    }

    console.log("Database initialized successfully.");

  } finally {
    client.release();
  }
}
