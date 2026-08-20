import { Router } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AdminLoginBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { sendAdminOtpEmail } from "../lib/mailer";

declare module "express-session" {
  interface SessionData {
    adminEmail?: string;
  }
}

const router = Router();

// ─── In-memory OTP store (cleared on server restart) ───────────────────────
// Map<adminEmail, { otp, expiresAt }>
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpViaWhatsApp(otp: string): Promise<void> {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const adminPhone = "918697080586";
    if (!phoneNumberId || !accessToken) { logger.warn("WhatsApp not configured — skipping OTP WhatsApp"); return; }
    const body = {
      messaging_product: "whatsapp",
      to: adminPhone,
      type: "text",
      text: { body: `🔐 *Aadity Fabrication Works – Admin OTP*\n\nYour OTP: *${otp}*\n\nValid for 10 minutes. Do not share this with anyone.` },
    };
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) { const err = await response.text(); logger.error({ status: response.status, body: err }, "WhatsApp OTP error"); }
    else logger.info("OTP WhatsApp sent");
  } catch (err) {
    logger.error(err, "Failed to send OTP via WhatsApp");
  }
}

async function sendOtpViaTelegram(otp: string): Promise<void> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) { logger.warn("Telegram not configured — skipping OTP Telegram"); return; }
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🔐 *Aadity Fabrication Works – Admin OTP*\n\nYour OTP: *${otp}*\n\nValid for 10 minutes\\. Do not share this with anyone\\.`,
        parse_mode: "MarkdownV2",
      }),
    });
    if (!response.ok) { const err = await response.text(); logger.error({ status: response.status, body: err }, "Telegram OTP error"); }
    else logger.info("OTP Telegram sent");
  } catch (err) {
    logger.error(err, "Failed to send OTP via Telegram");
  }
}

// ─── Auth routes ─────────────────────────────────────────────────────────────

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

// ─── OTP + Change-password routes ────────────────────────────────────────────

// POST /api/admin/request-otp
// Generates a 6-digit OTP and sends it via Email, WhatsApp, and Telegram.
router.post("/request-otp", async (req, res) => {
  if (!req.session.adminEmail) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const email = req.session.adminEmail;
  const otp = generateOtp();
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  req.log.info({ email, otp }, ">>>> OTP generated, about to send via all channels");

  // Send to all configured channels concurrently (best-effort)
  try {
    req.log.info("Calling sendAdminOtpEmail...");
    const emailPromise = sendAdminOtpEmail(email, otp).then(() => req.log.info("sendAdminOtpEmail resolved"))
      .catch(err => req.log.error({ err }, "sendAdminOtpEmail THROWN EXCEPTION"));
    req.log.info("Calling WhatsApp...");
    const whatsappPromise = sendOtpViaWhatsApp(otp).then(() => req.log.info("WhatsApp resolved"))
      .catch(err => req.log.error({ err }, "WhatsApp THROWN EXCEPTION"));
    req.log.info("Calling Telegram...");
    const telegramPromise = sendOtpViaTelegram(otp).then(() => req.log.info("Telegram resolved"))
      .catch(err => req.log.error({ err }, "Telegram THROWN EXCEPTION"));

    await Promise.all([emailPromise, whatsappPromise, telegramPromise]);
    req.log.info("All 3 channel send promises completed");
  } catch (err) {
    req.log.error({ err }, "Promise.all THROWN EXCEPTION in OTP send");
  }

  req.log.info({ email }, "OTP requested");
  res.json({ sent: true, message: "OTP sent via Email, WhatsApp, and Telegram" });
});

// POST /api/admin/change-password
// Verifies OTP and updates the password.
router.post("/change-password", async (req, res) => {
  if (!req.session.adminEmail) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { otp, newPassword } = req.body as { otp?: string; newPassword?: string };

  if (!otp || !newPassword) {
    res.status(400).json({ error: "OTP and new password are required" });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const email = req.session.adminEmail;
  const stored = otpStore.get(email);

  if (!stored) {
    res.status(400).json({ error: "No OTP requested. Please request one first." });
    return;
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    res.status(400).json({ error: "OTP has expired. Please request a new one." });
    return;
  }

  if (stored.otp !== otp.trim()) {
    res.status(400).json({ error: "Incorrect OTP. Please try again." });
    return;
  }

  try {
    const hash = await bcrypt.hash(newPassword, 12);
    await db
      .update(adminsTable)
      .set({ passwordHash: hash })
      .where(eq(adminsTable.email, email));

    otpStore.delete(email);
    req.log.info({ email }, "Admin password changed successfully");
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    req.log.error(err, "Failed to update password");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
