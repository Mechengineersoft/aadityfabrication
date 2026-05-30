import { Router } from "express";
import { db, inquiriesTable } from "@workspace/db";
import { eq, ilike, and, desc, sql, count } from "drizzle-orm";
import {
  CreateInquiryBody,
  UpdateInquiryBody,
  ListInquiriesQueryParams,
  GetInquiryParams,
  UpdateInquiryParams,
  DeleteInquiryParams,
} from "@workspace/api-zod";

const router = Router();

// Rate limiting store (in-memory, simple)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

// GET /api/inquiries
router.get("/", async (req, res) => {
  try {
    const parsed = ListInquiriesQueryParams.safeParse(req.query);
    const { status, service, search, page = 1, limit = 20 } =
      parsed.success ? parsed.data : {};

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(inquiriesTable.status, status));
    }
    if (service) {
      conditions.push(eq(inquiriesTable.service, service));
    }
    if (search) {
      conditions.push(
        ilike(inquiriesTable.name, `%${search}%`),
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(inquiriesTable)
        .where(where)
        .orderBy(desc(inquiriesTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() }).from(inquiriesTable).where(where),
    ]);

    res.json({
      data,
      total: Number(totalResult[0]?.count ?? 0),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/inquiries
router.post("/", async (req, res) => {
  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      "unknown";

    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    const parsed = CreateInquiryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }

    const [inquiry] = await db
      .insert(inquiriesTable)
      .values({ ...parsed.data, ipAddress: ip, status: "unread" })
      .returning();

    res.status(201).json(inquiry);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/inquiries/stats
router.get("/stats", async (req, res) => {
  try {
    const [totalResult, unreadResult, recentResult, byServiceResult] = await Promise.all([
      db.select({ count: count() }).from(inquiriesTable),
      db
        .select({ count: count() })
        .from(inquiriesTable)
        .where(eq(inquiriesTable.status, "unread")),
      db
        .select({ count: count() })
        .from(inquiriesTable)
        .where(
          sql`${inquiriesTable.createdAt} > now() - interval '7 days'`,
        ),
      db
        .select({ service: inquiriesTable.service, count: count() })
        .from(inquiriesTable)
        .groupBy(inquiriesTable.service),
    ]);

    res.json({
      total: Number(totalResult[0]?.count ?? 0),
      unread: Number(unreadResult[0]?.count ?? 0),
      recentCount: Number(recentResult[0]?.count ?? 0),
      byService: byServiceResult.map((r) => ({
        service: r.service,
        count: Number(r.count),
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/inquiries/export
router.get("/export", async (req, res) => {
  try {
    const inquiries = await db
      .select()
      .from(inquiriesTable)
      .orderBy(desc(inquiriesTable.createdAt));

    const headers = [
      "ID",
      "Name",
      "Company",
      "Phone",
      "Email",
      "Service",
      "Status",
      "Required Capacity",
      "Span (m)",
      "Shed Dimensions",
      "Existing Equipment",
      "Message",
      "Date",
    ];

    const rows = inquiries.map((i) => [
      i.id,
      `"${i.name}"`,
      `"${i.companyName ?? ""}"`,
      `"${i.phone}"`,
      `"${i.email}"`,
      `"${i.service}"`,
      i.status,
      i.requiredCapacity ?? "",
      i.spanMeters ?? "",
      `"${i.shedDimensions ?? ""}"`,
      `"${i.existingEquipment ?? ""}"`,
      `"${(i.message ?? "").replace(/"/g, '""')}"`,
      new Date(i.createdAt).toLocaleDateString("en-IN"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="inquiries-${new Date().toISOString().split("T")[0]}.csv"`,
    );
    res.send(csv);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/inquiries/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = GetInquiryParams.parse({ id: Number(req.params.id) });
    const [inquiry] = await db
      .select()
      .from(inquiriesTable)
      .where(eq(inquiriesTable.id, id));

    if (!inquiry) {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }
    res.json(inquiry);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// PATCH /api/inquiries/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = UpdateInquiryParams.parse({ id: Number(req.params.id) });
    const parsed = UpdateInquiryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }

    const [updated] = await db
      .update(inquiriesTable)
      .set(parsed.data)
      .where(eq(inquiriesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// DELETE /api/inquiries/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteInquiryParams.parse({ id: Number(req.params.id) });
    await db.delete(inquiriesTable).where(eq(inquiriesTable.id, id));
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;
