import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

// Test database connection first
export const db = new Pool({
  user: "username",
  host: "peerprep-auth-db",
  database: "auth-db",
  password: "password",
  port: 5432,
});
