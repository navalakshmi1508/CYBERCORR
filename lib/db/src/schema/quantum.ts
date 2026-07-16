import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quantumRiskTypeEnum = pgEnum("quantum_risk_type", [
  "harvest_now_decrypt_later",
  "weak_cryptography",
  "certificate_anomaly",
  "key_exposure",
  "quantum_channel_intercept",
]);

export const quantumRisksTable = pgTable("quantum_risks", {
  id: serial("id").primaryKey(),
  riskType: quantumRiskTypeEnum("risk_type").notNull(),
  severity: text("severity").notNull(),
  affectedSystem: text("affected_system").notNull(),
  cryptoAlgorithm: text("crypto_algorithm"),
  description: text("description").notNull(),
  mitigationRecommendation: text("mitigation_recommendation").notNull(),
  isResolved: boolean("is_resolved").notNull().default(false),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
});

export const insertQuantumRiskSchema = createInsertSchema(
  quantumRisksTable,
).omit({ id: true });
export type InsertQuantumRisk = z.infer<typeof insertQuantumRiskSchema>;
export type QuantumRisk = typeof quantumRisksTable.$inferSelect;
