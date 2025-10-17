import { Pool } from "../../node_modules/@types/pg/index.js";
import 'dotenv/config'  // loads .env.local
// Test database connection first
export const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});
