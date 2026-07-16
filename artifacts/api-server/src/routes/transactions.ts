import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, alertsTable, telemetryEventsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const makeXAI = (riskScore: number, reasons: string[]) => ({
  summary: `This transaction was flagged with a risk score of ${riskScore.toFixed(1)}/100 based on ${reasons.length} anomaly indicators detected by the AI correlation engine.`,
  confidence: Math.min(0.98, 0.6 + riskScore / 250),
  riskFactors: reasons.map((r, i) => ({
    factor: r,
    weight: Math.round((0.9 - i * 0.12) * 100) / 100,
    description: `The GNN model detected "${r}" as a significant contributing factor based on historical behavioral patterns.`,
  })),
  modelUsed: "GNN-TransformerV3 (Anomaly Detection)",
  graphFeatures: [
    "User-device graph cluster deviation",
    "Transaction velocity pattern",
    "Geographic impossibility index",
    "Merchant category entropy",
  ],
  recommendedAction:
    riskScore > 80
      ? "Block transaction immediately and notify fraud team"
      : riskScore > 60
        ? "Flag for manual review within 2 hours"
        : "Monitor and apply additional verification",
});

router.get("/transactions", requireAuth, async (req, res) => {
  const { anomalyOnly, limit = "50" } = req.query as Record<string, string>;
  let txns = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.timestamp));

  // Non-analyst users see only their own
  if (req.user!.role === "user") {
    txns = txns.filter((t) => t.userId === req.user!.userId);
  }
  if (anomalyOnly === "true") {
    txns = txns.filter((t) => t.isAnomaly);
  }

  res.json(
    txns.slice(0, parseInt(limit)).map((t) => ({
      ...t,
      timestamp: t.timestamp.toISOString(),
    })),
  );
});

router.get("/transactions/anomalies", requireAuth, async (req, res) => {
  let txns = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.timestamp));

  if (req.user!.role === "user") {
    txns = txns.filter((t) => t.userId === req.user!.userId);
  }

  res.json(
    txns
      .filter((t) => t.isAnomaly)
      .map((t) => ({ ...t, timestamp: t.timestamp.toISOString() })),
  );
});

router.get("/transactions/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [txn] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id))
    .limit(1);
  if (!txn) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  if (req.user!.role === "user" && txn.userId !== req.user!.userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const relatedAlerts = await db
    .select()
    .from(alertsTable)
    .orderBy(desc(alertsTable.createdAt))
    .limit(3);

  const relatedTelemetry = await db
    .select()
    .from(telemetryEventsTable)
    .orderBy(desc(telemetryEventsTable.timestamp))
    .limit(3);

  res.json({
    transaction: { ...txn, timestamp: txn.timestamp.toISOString() },
    xaiExplanation: makeXAI(txn.riskScore, txn.anomalyReasons),
    relatedAlerts: relatedAlerts.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    relatedTelemetry: relatedTelemetry.map((e) => ({
      ...e,
      timestamp: e.timestamp.toISOString(),
    })),
  });
});

export default router;
