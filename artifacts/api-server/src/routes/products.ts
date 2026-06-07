import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

// GET /api/products — public, active only (or ?all=1 for admin)
router.get("/", async (req, res) => {
  try {
    const all = req.query.all === "1";
    let rows;
    if (all) {
      rows = await db.select().from(productsTable).orderBy(asc(productsTable.sortOrder), asc(productsTable.createdAt));
    } else {
      rows = await db.select().from(productsTable).where(eq(productsTable.active, true)).orderBy(asc(productsTable.sortOrder), asc(productsTable.createdAt));
    }
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  const b = req.body as Record<string, unknown>;
  if (!b.name || typeof b.name !== "string") {
    res.status(400).json({ error: "name is required" });
    return;
  }
  try {
    const [row] = await db.insert(productsTable).values({
      name: String(b.name),
      category: typeof b.category === "string" ? b.category : "",
      productType: typeof b.productType === "string" ? b.productType : "",
      description: typeof b.description === "string" ? b.description : "",
      specs: typeof b.specs === "string" ? b.specs || null : null,
      imageUrl: typeof b.imageUrl === "string" ? b.imageUrl || null : null,
      active: typeof b.active === "boolean" ? b.active : true,
      sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : 0,
    }).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/products/:id
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const b = req.body as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (typeof b.name === "string") patch.name = b.name;
  if (typeof b.category === "string") patch.category = b.category;
  if (typeof b.productType === "string") patch.productType = b.productType;
  if (typeof b.description === "string") patch.description = b.description;
  if (typeof b.specs === "string") patch.specs = b.specs || null;
  if (typeof b.imageUrl === "string") patch.imageUrl = b.imageUrl || null;
  if (typeof b.active === "boolean") patch.active = b.active;
  if (typeof b.sortOrder === "number") patch.sortOrder = b.sortOrder;
  if (Object.keys(patch).length === 0) { res.status(400).json({ error: "No valid fields" }); return; }
  try {
    const [updated] = await db.update(productsTable).set(patch).where(eq(productsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
