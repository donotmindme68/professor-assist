import { Sequelize } from 'sequelize';
import 'dotenv/config';

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

// Initialize Sequelize based on DATABASE_MODE
let sequelize: Sequelize;

if (process.env.DATABASE_MODE === 'cloud') {
  console.log("🌐 Using cloud database (Neon)...");
  sequelize = new Sequelize(process.env.NEON_DATABASE_URL!, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else if (process.env.DATABASE_MODE === 'local') {
  console.log("💻 Using local database...");
  sequelize = new Sequelize(process.env.DATABASE_URL!, {
    dialect: 'postgres',
  });
} else {
  throw new Error("❌ Invalid DATABASE_MODE. Use 'cloud' or 'local'.");
}

// Function to ensure all tables/relations exist
export async function ensureSchema() {
  console.log("🔄 Ensuring all schema entities exist...");
  await sequelize.sync({ alter: true });
  console.log("✅ All schema entities ensured successfully!");
}

ensureSchema()
// Export sequelize instance
export { sequelize };