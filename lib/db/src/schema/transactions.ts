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

export const transactionTypeEnum = pgEnum("transaction_type", [
  "transfer",
  "withdrawal",
  "deposit",
  "payment",
  "wire",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "approved",
  "flagged",
  "blocked",
  "under_review",
]);

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  accountId: text("account_id").notNull(),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  merchantName: text("merchant_name"),
  merchantCategory: text("merchant_category"),
  riskScore: real("risk_score").notNull().default(0),
  isAnomaly: boolean("is_anomaly").notNull().default(false),
  anomalyReasons: text("anomaly_reasons").array().notNull().default([]),
  status: transactionStatusEnum("status").notNull().default("approved"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(
  transactionsTable,
).omit({ id: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
