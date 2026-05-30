import { Router } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQueryParams,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
} from "@workspace/api-zod";

const router = Router();

// GET /api/projects
router.get("/", async (req, res) => {
  try {
    const parsed = ListProjectsQueryParams.safeParse(req.query);
    const { category, featured } = parsed.success ? parsed.data : {};

    let query = db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));

    const conditions = [];
    if (category) conditions.push(eq(projectsTable.category, category));
    if (featured !== undefined) conditions.push(eq(projectsTable.featured, featured === true));

    const data =
      conditions.length > 0
        ? await db
            .select()
            .from(projectsTable)
            .where(conditions.length === 1 ? conditions[0] : undefined)
            .orderBy(desc(projectsTable.createdAt))
        : await query;

    res.json(data);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/projects
router.post("/", async (req, res) => {
  try {
    const parsed = CreateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const [project] = await db.insert(projectsTable).values(parsed.data).returning();
    res.status(201).json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse({ id: Number(req.params.id) });
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// PATCH /api/projects/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = UpdateProjectParams.parse({ id: Number(req.params.id) });
    const parsed = UpdateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const [updated] = await db
      .update(projectsTable)
      .set(parsed.data)
      .where(eq(projectsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteProjectParams.parse({ id: Number(req.params.id) });
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;
