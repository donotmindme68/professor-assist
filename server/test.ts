import { db, ensureSchema } from '@db'; // Import db and ensureSchema from @db
import { contentCreators, subscribers } from "@db/schema"; // Import schema
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export async function testDatabase() {
  try {
    console.log("🔄 Ensuring schema exists...");
    await ensureSchema(); // Ensure all tables exist before inserting data

    console.log("🔄 Establishing database connection...");

    // Hash password for test users
    const passwordHash = await bcrypt.hash("password123", 10);

    // Insert a Content Creator
    const creator = await db.insert(contentCreators).values({
      email: "creator@example.com",
      passwordHash,
    }).returning();

    console.log("✅ Content Creator inserted:", creator);

    // Insert a Subscriber
    const subscriber = await db.insert(subscribers).values({
      email: "subscriber@example.com",
      passwordHash,
    }).returning();

    console.log("✅ Subscriber inserted:", subscriber);

    console.log("🎉 Test data inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting test data:", error.message);
  }
}