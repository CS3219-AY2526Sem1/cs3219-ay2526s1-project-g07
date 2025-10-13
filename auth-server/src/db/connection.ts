import { Pool } from "pg";

// export const db = new Pool({
//   user: "username",
//   host: "peerprep-auth-db",
//   database: "auth-db",
//   password: "password",
//   port: 5432,
// });

console.log("DB_USER:", process.env.DB_USER);
export const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});
