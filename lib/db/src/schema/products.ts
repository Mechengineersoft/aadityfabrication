import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default(""),
  productType: text("product_type").notNull().default(""),
  description: text("description").notNull().default(""),
  specs: text("specs"),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = typeof productsTable.$inferInsert;
