import { Router } from "express";
import { db, servicesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  CreateServiceBody,
  UpdateServiceBody,
  UpdateServiceParams,
} from "@workspace/api-zod";

const router = Router();

// GET /api/services
router.get("/", async (req, res) => {
  try {
    const data = await db
      .select()
      .from(servicesTable)
      .orderBy(asc(servicesTable.sortOrder));
    res.json(data);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/services
router.post("/", async (req, res) => {
  try {
    const parsed = CreateServiceBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const [service] = await db.insert(servicesTable).values(parsed.data).returning();
    res.status(201).json(service);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/services/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = UpdateServiceParams.parse({ id: Number(req.params.id) });
    const parsed = UpdateServiceBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const [updated] = await db
      .update(servicesTable)
      .set(parsed.data)
      .where(eq(servicesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// DELETE /api/services/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    await db.delete(servicesTable).where(eq(servicesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
