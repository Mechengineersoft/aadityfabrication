import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const heroImagesTable = pgTable("hero_images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHeroImageSchema = createInsertSchema(heroImagesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertHeroImage = z.infer<typeof insertHeroImageSchema>;
export type HeroImage = typeof heroImagesTable.$inferSelect;
