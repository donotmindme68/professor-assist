import pg from 'pg';
import {Pool as NeonPool, neonConfig} from '@neondatabase/serverless'; // For Neon
import {drizzle as neonDrizzle} from 'drizzle-orm/neon-serverless'; // For Neon
import {drizzle as pgDrizzle} from 'drizzle-orm/node-postgres'; // For local PostgreSQL
import ws from "ws";
import * as schema from "./schema"; // Import your schema
import {sql} from 'drizzle-orm'; // For executing raw SQL
import 'config';
import {PgSerial, PgTable} from "drizzle-orm/pg-core";
import {NodePgDatabase} from "drizzle-orm/node-postgres/driver";

// Ensure DATABASE_MODE is set
if (!process.env.DATABASE_MODE) {
  throw new Error("❌ DATABASE_MODE is not set in environment variables.");
}

// Ensure the appropriate database URL is set
if (process.env.DATABASE_MODE === 'cloud' && !process.env.NEON_DATABASE_URL) {
  throw new Error("❌ NEON_DATABASE_URL is not set for cloud mode.");
}
if (process.env.DATABASE_MODE === 'local' && !process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set for local mode.");
}

// Configure WebSocket for Neon
if (process.env.DATABASE_MODE === 'cloud') {
  neonConfig.webSocketConstructor = ws;
}

// Initialize pool and db based on DATABASE_MODE
let pool;
let db: NeonDatabase<Record<string, unknown>> | NodePgDatabase<Record<string, unknown>>;

if (process.env.DATABASE_MODE === 'cloud') {
  console.log("🌐 Using cloud database (Neon)...");
  pool = new NeonPool({connectionString: process.env.NEON_DATABASE_URL});
  db = neonDrizzle(pool, {schema});
} else if (process.env.DATABASE_MODE === 'local') {
  console.log("💻 Using local database...");
  const {Pool} = pg;
  pool = new Pool({connectionString: process.env.DATABASE_URL});
  db = pgDrizzle(pool, {schema});
} else {
  throw new Error("❌ Invalid DATABASE_MODE. Use 'cloud' or 'local'.");
}

// Function to ensure all tables/relations exist
export async function ensureSchema() {
  console.log("🔄 Ensuring all schema entities exist...");

  // Get all table names and their schema definitions
  const tables = Object.entries(schema).filter(([, value]) => {
    return value instanceof PgTable;
  });

  for (const [tableName, tableConfig] of tables) {

    const columns = Object.entries(tableConfig[Symbol.for('drizzle:Columns')])
      .map(([columnName, {config: columnDef}]) => {
        const columnType = columnDef.dataType; // e.g., 'serial', 'text', 'timestamp', etc.
        const constraints = [];

        if (columnDef.primaryKey) constraints.push('PRIMARY KEY');
        if (columnDef.notNull) constraints.push('NOT NULL');
        if (columnDef.unique) constraints.push('UNIQUE');
        if (columnDef.default !== undefined) constraints.push(`DEFAULT ${columnDef.default}`);

        return `${columnName} ${columnType} ${constraints.join(' ')}`;
      })
      .join(', ');

    const createTableSQL = sql`CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
    await db.execute(createTableSQL);
    console.log(`✅ Table ${tableConfig.name} ensured.`);
  }

  console.log("✅ All schema entities ensured successfully!");
}

// Export pool and db
export {pool, db};