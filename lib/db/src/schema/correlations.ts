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
import { alertsTable } from "./alerts";

export const correlationTypeEnum = pgEnum("correlation_type", [
  "telemetry_transaction",
  "multi_account",
  "device_cluster",
  "geo_anomaly",
  "time_pattern",
  "quantum_exposure",
]);

export const correlationsTable = pgTable("correlations", {
  id: serial("id").primaryKey(),
  correlationType: correlationTypeEnum("correlation_type").notNull(),
  strength: real("strength").notNull(),
  involvedEntities: text("involved_entities").array().notNull().default([]),
  telemetryEventIds: integer("telemetry_event_ids").array().notNull().default([]),
  transactionIds: integer("transaction_ids").array().notNull().default([]),
  alertId: integer("alert_id").references(() => alertsTable.id),
  description: text("description").notNull(),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
});

export const insertCorrelationSchema = createInsertSchema(
  correlationsTable,
).omit({ id: true });
export type InsertCorrelation = z.infer<typeof insertCorrelationSchema>;
export type Correlation = typeof correlationsTable.$inferSelect;
