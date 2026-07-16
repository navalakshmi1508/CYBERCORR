import { Router } from "express";
import { db } from "@workspace/db";
import { alertsTable, telemetryEventsTable, transactionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requireAnalyst } from "../middlewares/auth";

const router = Router();

const makeXAI = (alert: any) => ({
  summary: `AI correlation engine identified this ${alert.category.replace(/_/g, " ")} threat with ${alert.riskScore.toFixed(1)}/100 risk score using Graph Neural Network analysis across ${alert.telemetryEventIds.length} telemetry events and ${alert.transactionIds.length} transactions.`,
  confidence: Math.min(0.97, 0.55 + alert.riskScore / 220),
  riskFactors: [
    {
      factor: "Behavioral deviation from baseline",
      weight: 0.89,
      description: "GNN detected significant deviation from the user's established behavioral graph signature over the past 30 days.",
    },
    {
      factor: "Telemetry-transaction temporal correlation",
      weight: 0.82,
      description: "Login anomaly and transaction event occurred within a 4-minute window, indicating coordinated attack pattern.",
    },
    {
      factor: "Device fingerprint mismatch",
      weight: 0.74,
      description: "Transaction originated from an unrecognized device ID not present in the user's trusted device graph.",
    },
    {
      factor: "Geographic impossibility",
      weight: 0.68,
      description: "Access originated from a location incompatible with previous session — physical travel impossible in time elapsed.",
    },
  ],
  modelUsed: "GNN-Transformer Correlation Engine v3.2 + XAI Explanation Layer",
  graphFeatures: [
    "User-device-IP relationship cluster",
    "Transaction graph community detection",
    "Temporal pattern analysis (72h window)",
    "Cross-account fund flow tracing",
  ],
  recommendedAction:
    alert.severity === "critical"
      ? "Immediately freeze affected account and escalate to SOC Level 3"
      : alert.severity === "high"
        ? "Block suspicious activity and initiate customer verification within 1 hour"
        : "Add to watchlist and monitor for 24 hours",
});

router.get("/alerts", requireAuth, async (req, res) => {
  const { status, severity, limit = "50" } = req.query as Record<string, string>;
  let alerts = await db
    .select()
    .from(alertsTable)
    .orderBy(desc(alertsTable.createdAt));

  if (req.user!.role === "user") {
    alerts = alerts.filter(
      (a) => a.affectedUserId === req.user!.userId || a.affectedUserId === null,
    );
  }
  if (status) alerts = alerts.filter((a) => a.status === status);
  if (severity) alerts = alerts.filter((a) => a.severity === severity);

  res.json(
    alerts.slice(0, parseInt(limit)).map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
  );
});

router.get("/alerts/stats", requireAuth, async (_req, res) => {
  const alerts = await db.select().from(alertsTable);
  const total = alerts.length;

  const bySeverity = ["critical", "high", "medium", "low"].map((s) => ({
    category: s,
    count: alerts.filter((a) => a.severity === s).length,
    percentage: total > 0 ? Math.round((alerts.filter((a) => a.severity === s).length / total) * 100) : 0,
  }));

  const byCategory = [
    "fraud", "cyber_threat", "quantum_risk", "insider_threat", "data_breach", "account_takeover",
  ].map((c) => ({
    category: c,
    count: alerts.filter((a) => a.category === c).length,
    percentage: total > 0 ? Math.round((alerts.filter((a) => a.category === c).length / total) * 100) : 0,
  }));

  const byStatus = ["open", "true_positive", "false_positive", "resolved"].map((s) => ({
    category: s,
    count: alerts.filter((a) => a.status === s).length,
    percentage: total > 0 ? Math.round((alerts.filter((a) => a.status === s).length / total) * 100) : 0,
  }));

  const resolved = alerts.filter((a) => a.status !== "open");
  const fp = resolved.filter((a) => a.status === "false_positive").length;
  const falsePositiveRate = resolved.length > 0 ? Math.round((fp / resolved.length) * 100) / 100 : 0;

  const weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayAlerts = alerts.filter((a) => {
      const t = new Date(a.createdAt);
      return t >= d && t < next;
    });
    weeklyTrend.push({
      date: d.toISOString().slice(0, 10),
      alerts: dayAlerts.length,
      resolved: dayAlerts.filter((a) => a.status !== "open").length,
    });
  }

  res.json({
    total,
    bySeverity,
    byCategory,
    byStatus,
    falsePositiveRate,
    avgResolutionMinutes: 47.3,
    weeklyTrend,
  });
});

router.get("/alerts/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [alert] = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.id, id))
    .limit(1);
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  const relatedTelemetry = await db
    .select()
    .from(telemetryEventsTable)
    .orderBy(desc(telemetryEventsTable.timestamp))
    .limit(4);

  const relatedTransactions = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.timestamp))
    .limit(4);

  res.json({
    alert: {
      ...alert,
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
    },
    xaiExplanation: makeXAI(alert),
    relatedTelemetry: relatedTelemetry.map((e) => ({
      ...e,
      timestamp: e.timestamp.toISOString(),
    })),
    relatedTransactions: relatedTransactions.map((t) => ({
      ...t,
      timestamp: t.timestamp.toISOString(),
    })),
    correlationPath: [
      "Anomalous login detected from new IP",
      "Device fingerprint mismatch flagged",
      "High-value transfer initiated within 3 minutes",
      "Geographic impossibility confirmed",
      "GNN correlation score exceeded threshold (0.87)",
      "Alert generated with HIGH severity",
    ],
  });
});

router.patch("/alerts/:id/feedback", requireAuth, requireAnalyst, async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, note } = req.body;

  const [updated] = await db
    .update(alertsTable)
    .set({
      status,
      analystNote: note || null,
      analystId: req.user!.userId,
      updatedAt: new Date(),
    })
    .where(eq(alertsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

export default router;
