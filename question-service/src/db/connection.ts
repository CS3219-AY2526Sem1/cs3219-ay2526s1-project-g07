import { Pool } from "pg";

// Test database connection first
export const db = new Pool({
  user: "username",
  host: "peerprep-auth-db",
  database: "auth-db",
  password: "password",
  port: 5432,
});
