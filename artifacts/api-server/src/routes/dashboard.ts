import { Router } from "express";
import { db } from "@workspace/db";
import {
  alertsTable,
  telemetryEventsTable,
  transactionsTable,
  quantumRisksTable,
} from "@workspace/db";
import { eq, sql, desc, and, gte } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  const alerts = await db.select().from(alertsTable).orderBy(desc(alertsTable.createdAt));
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const openAlerts = alerts.filter((a) => a.status === "open").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const resolvedToday = alerts.filter(
    (a) =>
      (a.status === "resolved" || a.status === "true_positive") &&
      new Date(a.updatedAt) >= today,
  ).length;

  const byCategory = [
    "fraud", "cyber_threat", "quantum_risk", "insider_threat", "data_breach", "account_takeover",
  ].map((cat) => ({
    category: cat,
    count: alerts.filter((a) => a.category === cat).length,
    percentage: totalAlerts > 0 ? Math.round((alerts.filter((a) => a.category === cat).length / totalAlerts) * 100) : 0,
  }));

  // Last 7 days trend
  const alertTrend = [];
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
    alertTrend.push({
      date: d.toISOString().slice(0, 10),
      alerts: dayAlerts.length,
      resolved: dayAlerts.filter((a) => a.status !== "open").length,
    });
  }

  const transactions = await db.select().from(transactionsTable);
  const anomalies = transactions.filter((t) => t.isAnomaly).length;

  const quantumRisks = await db.select().from(quantumRisksTable);
  const unresolvedQuantum = quantumRisks.filter((q) => !q.isResolved);
  let quantumLevel: "low" | "moderate" | "elevated" | "critical" = "low";
  if (unresolvedQuantum.some((q) => q.severity === "critical")) quantumLevel = "critical";
  else if (unresolvedQuantum.some((q) => q.severity === "high")) quantumLevel = "elevated";
  else if (unresolvedQuantum.length > 0) quantumLevel = "moderate";

  const resolved = alerts.filter((a) => a.status !== "open");
  const fp = alerts.filter((a) => a.status === "false_positive").length;
  const falsePositiveRate = resolved.length > 0 ? Math.round((fp / resolved.length) * 100) / 100 : 0;
  const riskScore = Math.min(
    100,
    Math.round(
      (criticalAlerts * 15 + openAlerts * 3 + anomalies * 5 + unresolvedQuantum.length * 10),
    ),
  );

  const topThreats = alerts
    .filter((a) => a.status === "open")
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

  res.json({
    totalAlerts,
    criticalAlerts,
    openAlerts,
    resolvedToday,
    riskScore,
    threatsByCategory: byCategory,
    alertTrend,
    topThreats,
    recentTransactionAnomalies: anomalies,
    quantumRiskLevel: quantumLevel,
    falsePositiveRate,
    avgResolutionMinutes: 47.3,
  });
});

router.get("/dashboard/risk-score", requireAuth, async (_req, res) => {
  const alerts = await db.select().from(alertsTable);
  const transactions = await db.select().from(transactionsTable);
  const quantum = await db.select().from(quantumRisksTable);

  const cyberAlerts = alerts.filter((a) => a.category === "cyber_threat" || a.category === "data_breach");
  const fraudAlerts = alerts.filter((a) => a.category === "fraud" || a.category === "account_takeover");
  const qRisks = quantum.filter((q) => !q.isResolved);

  const cyber = Math.min(100, cyberAlerts.filter(a => a.status === "open").length * 12 + 20);
  const fraud = Math.min(100, fraudAlerts.filter(a => a.status === "open").length * 10 + transactions.filter(t => t.isAnomaly).length * 4 + 15);
  const quantumScore = Math.min(100, qRisks.length * 18 + 10);
  const overall = Math.round((cyber * 0.4 + fraud * 0.35 + quantumScore * 0.25));

  res.json({
    overall,
    cyber,
    fraud,
    quantum: quantumScore,
    trend: overall > 65 ? "worsening" : overall > 45 ? "stable" : "improving",
    lastUpdated: new Date().toISOString(),
  });
});

router.get("/dashboard/activity", requireAuth, async (_req, res) => {
  const alerts = await db.select().from(alertsTable).orderBy(desc(alertsTable.createdAt)).limit(10);
  const transactions = await db.select().from(transactionsTable).where(eq(transactionsTable.isAnomaly, true)).orderBy(desc(transactionsTable.timestamp)).limit(5);

  const items = [
    ...alerts.map((a, i) => ({
      id: i + 1,
      type: a.status === "open" ? "alert_created" : "alert_resolved",
      title: a.title,
      description: a.description.slice(0, 80),
      severity: a.severity,
      timestamp: a.createdAt.toISOString(),
    })),
    ...transactions.map((t, i) => ({
      id: alerts.length + i + 1,
      type: "anomaly_detected",
      title: `Anomalous ${t.transactionType} - ₹${t.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      description: t.anomalyReasons[0] || "Suspicious transaction pattern detected",
      severity: t.riskScore > 80 ? "critical" : t.riskScore > 60 ? "high" : "medium",
      timestamp: t.timestamp.toISOString(),
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

  res.json(items);
});

export default router;
