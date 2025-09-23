import { betterAuth } from "better-auth"
import { Pool } from "pg";
import { jwt } from "better-auth/plugins"
import fs from "fs";
import path from "path";

// console.log("hey")
// Test database connection first
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    
    // Check if tables already exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'session', 'account', 'verification');
    `;
    
    const result = await client.query(tablesQuery);
    console.log("📊 Existing tables found:", result.rows.map(row => row.table_name));
    
    if (result.rows.length === 0) {
      console.log("🔧 No tables found, initializing database...");
      
      // Read and execute init.sql
      const initSqlPath = path.join(process.cwd(), "db", "init.sql");
      
      if (fs.existsSync(initSqlPath)) {
        const initSql = fs.readFileSync(initSqlPath, "utf8");
        
        // Split SQL by semicolons and execute each statement
        const statements = initSql.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
          if (statement.trim()) {
            await client.query(statement);
          }
        }
        
        console.log("✅ Database initialized successfully!");
        
        // Verify tables were created
        const verifyResult = await client.query(tablesQuery);
        console.log("📋 Created tables:", verifyResult.rows.map(row => row.table_name));
      } else {
        console.log("❌ init.sql file not found at:", initSqlPath);
      }
    } else {
      console.log("✅ Database tables already exist, skipping initialization");
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
};

export const testDbConnection = async () => {
  return await initializeDatabase();
};


export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }),
  emailAndPassword: {    
    enabled: true,
    autoSignIn: false //defaults to true
    // requireEmailVerification: true // defaults to false
  },
  trustedOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"], // your client URL
  plugins: [ 
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "EdDSA",
          crv: "Ed25519"
        }
      }
    }),
  ],
})