import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const alertStatusEnum = pgEnum("alert_status", [
  "open",
  "true_positive",
  "false_positive",
  "resolved",
]);

export const alertCategoryEnum = pgEnum("alert_category", [
  "fraud",
  "cyber_threat",
  "quantum_risk",
  "insider_threat",
  "data_breach",
  "account_takeover",
]);

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // reuse severityEnum values
  category: alertCategoryEnum("category").notNull(),
  status: alertStatusEnum("status").notNull().default("open"),
  riskScore: real("risk_score").notNull(),
  affectedUserId: integer("affected_user_id").references(() => usersTable.id),
  affectedAccountId: text("affected_account_id"),
  analystId: integer("analyst_id").references(() => usersTable.id),
  analystNote: text("analyst_note"),
  telemetryEventIds: integer("telemetry_event_ids").array().notNull().default([]),
  transactionIds: integer("transaction_ids").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
