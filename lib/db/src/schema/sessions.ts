
import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull(),
});
