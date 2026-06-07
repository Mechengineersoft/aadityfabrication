import { Router } from "express";
import { db, heroImagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

function parseHeroImageBody(body: unknown): { url: string; displayOrder: number; active: boolean } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.url !== "string" || !b.url.trim()) return null;
  return {
    url: b.url.trim(),
    displayOrder: typeof b.displayOrder === "number" ? b.displayOrder : 0,
    active: typeof b.active === "boolean" ? b.active : true,
  };
}

// GET /api/hero-images — public
router.get("/", async (req, res) => {
  try {
    const images = await db
      .select()
      .from(heroImagesTable)
      .where(eq(heroImagesTable.active, true))
      .orderBy(asc(heroImagesTable.displayOrder), asc(heroImagesTable.createdAt));
    res.json(images);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/hero-images/all — admin: all including inactive
router.get("/all", async (req, res) => {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const images = await db
      .select()
      .from(heroImagesTable)
      .orderBy(asc(heroImagesTable.displayOrder), asc(heroImagesTable.createdAt));
    res.json(images);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/hero-images — admin
router.post("/", async (req, res) => {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = parseHeroImageBody(req.body);
  if (!parsed) {
    res.status(400).json({ error: "Invalid data" });
    return;
  }
  try {
    const [image] = await db.insert(heroImagesTable).values(parsed).returning();
    res.status(201).json(image);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/hero-images/:id — admin
router.patch("/:id", async (req, res) => {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const body = req.body as Record<string, unknown>;
  const patch: Partial<{ url: string; displayOrder: number; active: boolean }> = {};
  if (typeof body.url === "string") patch.url = body.url;
  if (typeof body.displayOrder === "number") patch.displayOrder = body.displayOrder;
  if (typeof body.active === "boolean") patch.active = body.active;
  if (Object.keys(patch).length === 0) { res.status(400).json({ error: "No valid fields" }); return; }
  try {
    const [updated] = await db
      .update(heroImagesTable)
      .set(patch)
      .where(eq(heroImagesTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/hero-images/:id — admin
router.delete("/:id", async (req, res) => {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    await db.delete(heroImagesTable).where(eq(heroImagesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
