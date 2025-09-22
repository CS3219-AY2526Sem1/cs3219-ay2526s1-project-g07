import { betterAuth } from "better-auth"
import { Pool } from "pg";
import { jwt } from "better-auth/plugins"

// console.log("hey")
// Test database connection first
const pool = new Pool({
  user: "username",
  host: "localhost", 
  database: "auth-db",
  password: "password",
  port: 5432,
});

export const testDbConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    
    // Check if Better Auth tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'session', 'account', 'verification');
    `;
    
    const result = await client.query(tablesQuery);
    console.log("📊 Better Auth tables found:", result.rows);
    
    if (result.rows.length === 0) {
      console.log("❌ No Better Auth tables found! Run: npx @better-auth/cli generate");
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};


export const auth = betterAuth({
  database: new Pool({
    // connection options
    user: "username",
    host: "localhost",
    database: "auth-db",
    password: "password",
    port: 5432,
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