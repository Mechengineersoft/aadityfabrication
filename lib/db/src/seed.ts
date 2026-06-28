
import { db, adminsTable } from "./index.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const DEFAULT_ADMIN_EMAIL = "admin@aadityfabrication.com";
const DEFAULT_ADMIN_PASSWORD = "Admin123!";

async function seed() {
  try {
    // Check if admin already exists
    const [existingAdmin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, DEFAULT_ADMIN_EMAIL));

    if (existingAdmin) {
      console.log("Default admin already exists!");
      process.exit(0);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    // Insert the admin
    await db.insert(adminsTable).values({
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: passwordHash,
    });

    console.log("Successfully created default admin!");
    console.log(`Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seed();
