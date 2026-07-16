import { Router } from "express";
import { db } from "@workspace/db";
import { telemetryEventsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/telemetry/events", requireAuth, async (req, res) => {
  const { severity, type, limit = "50" } = req.query as Record<string, string>;
  let events = await db
    .select()
    .from(telemetryEventsTable)
    .orderBy(desc(telemetryEventsTable.timestamp));

  if (severity) events = events.filter((e) => e.severity === severity);
  if (type) events = events.filter((e) => e.eventType === type);

  res.json(
    events.slice(0, parseInt(limit)).map((e) => ({
      ...e,
      timestamp: e.timestamp.toISOString(),
    })),
  );
});

router.get("/telemetry/events/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [event] = await db
    .select()
    .from(telemetryEventsTable)
    .where(eq(telemetryEventsTable.id, id))
    .limit(1);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json({ ...event, timestamp: event.timestamp.toISOString() });
});

router.get("/telemetry/summary", requireAuth, async (_req, res) => {
  const events = await db.select().from(telemetryEventsTable);
  const types = [
    "login_attempt", "network_anomaly", "endpoint_alert",
    "certificate_anomaly", "privilege_escalation", "lateral_movement", "data_exfiltration",
  ];
  const severities = ["critical", "high", "medium", "low"];
  const total = events.length;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const last24h = events.filter((e) => new Date(e.timestamp) >= yesterday).length;

  res.json({
    byType: types.map((t) => ({
      category: t,
      count: events.filter((e) => e.eventType === t).length,
      percentage: total > 0 ? Math.round((events.filter((e) => e.eventType === t).length / total) * 100) : 0,
    })),
    bySeverity: severities.map((s) => ({
      category: s,
      count: events.filter((e) => e.severity === s).length,
      percentage: total > 0 ? Math.round((events.filter((e) => e.severity === s).length / total) * 100) : 0,
    })),
    totalLast24h: last24h,
    avgPerHour: Math.round((last24h / 24) * 10) / 10,
  });
});

export default router;
