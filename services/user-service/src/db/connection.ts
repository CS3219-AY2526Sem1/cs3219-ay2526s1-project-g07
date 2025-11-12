import { Pool } from "pg";

// export const db = new Pool({
//   user: "username",
//   host: "peerprep-auth-db",
//   database: "auth-db",
//   password: "password",
//   port: 5432,
// });

// console.log("DB_USER:", process.env.DATABASE);
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
});
