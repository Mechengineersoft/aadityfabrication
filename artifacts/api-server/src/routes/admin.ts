import { Router } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AdminLoginBody } from "@workspace/api-zod";

declare module "express-session" {
  interface SessionData {
    adminEmail?: string;
  }
}

const router = Router();

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const { email, password } = parsed.data;
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, email));

    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    req.session.adminEmail = admin.email;
    req.session.save((err) => {
      if (err) {
        req.log.error(err, "session save failed");
        res.status(500).json({ error: "Session error" });
        return;
      }
      res.json({ authenticated: true, email: admin.email });
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

// GET /api/admin/me
router.get("/me", async (req, res) => {
  if (req.session.adminEmail) {
    res.json({ authenticated: true, email: req.session.adminEmail });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
