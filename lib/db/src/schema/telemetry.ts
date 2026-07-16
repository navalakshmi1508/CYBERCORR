import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const severityEnum = pgEnum("severity", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const telemetryEventTypeEnum = pgEnum("telemetry_event_type", [
  "login_attempt",
  "network_anomaly",
  "endpoint_alert",
  "certificate_anomaly",
  "privilege_escalation",
  "lateral_movement",
  "data_exfiltration",
]);

export const telemetryEventsTable = pgTable("telemetry_events", {
  id: serial("id").primaryKey(),
  eventType: telemetryEventTypeEnum("event_type").notNull(),
  severity: severityEnum("severity").notNull(),
  sourceIp: text("source_ip").notNull(),
  destinationIp: text("destination_ip"),
  userId: integer("user_id").references(() => usersTable.id),
  deviceId: text("device_id"),
  description: text("description").notNull(),
  isCorrelated: boolean("is_correlated").notNull().default(false),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTelemetryEventSchema = createInsertSchema(
  telemetryEventsTable,
).omit({ id: true });
export type InsertTelemetryEvent = z.infer<typeof insertTelemetryEventSchema>;
export type TelemetryEvent = typeof telemetryEventsTable.$inferSelect;
