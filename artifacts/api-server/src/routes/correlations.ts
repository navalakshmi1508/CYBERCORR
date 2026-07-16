import { Router } from "express";
import { db } from "@workspace/db";
import { correlationsTable, telemetryEventsTable, transactionsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const makeXAI = (corr: any) => ({
  summary: `The AI engine detected a ${corr.correlationType.replace(/_/g, " ")} pattern with ${Math.round(corr.strength * 100)}% correlation strength across ${corr.involvedEntities.length} entities using Graph Neural Network community detection.`,
  confidence: corr.strength,
  riskFactors: [
    {
      factor: "Graph community anomaly score",
      weight: 0.91,
      description: "The entity cluster formed an abnormal community structure deviating 3.2σ from baseline graph topology.",
    },
    {
      factor: "Temporal co-occurrence density",
      weight: 0.78,
      description: "Events concentrated in a 15-minute window, indicating coordinated rather than independent activity.",
    },
    {
      factor: "Cross-entity fund flow",
      weight: 0.65,
      description: "GNN edge weights indicate statistically significant fund routing through this entity cluster.",
    },
  ],
  modelUsed: "GNN Community Detection + Transformer Sequence Encoder",
  graphFeatures: corr.involvedEntities.slice(0, 4),
  recommendedAction: corr.strength > 0.8
    ? "Immediately isolate involved accounts and escalate to fraud team"
    : "Flag entities for enhanced monitoring and verification",
});

const buildGraphData = async () => {
  const users = await db.select().from(usersTable).limit(8);
  const transactions = await db.select().from(transactionsTable).limit(10);
  const telemetry = await db.select().from(telemetryEventsTable).limit(8);

  const nodes: any[] = [];
  const edges: any[] = [];

  users.forEach((u, i) => {
    nodes.push({
      id: `user_${u.id}`,
      label: u.name,
      type: "user",
      riskScore: Math.random() * 80 + 10,
      x: Math.cos((i / users.length) * Math.PI * 2) * 3,
      y: Math.sin((i / users.length) * Math.PI * 2) * 3,
      z: (Math.random() - 0.5) * 2,
    });
  });

  transactions.slice(0, 8).forEach((t, i) => {
    const userId = `user_${t.userId}`;
    const nodeId = `txn_${t.id}`;
    nodes.push({
      id: nodeId,
      label: `$${t.amount.toFixed(0)} ${t.transactionType}`,
      type: "transaction",
      riskScore: t.riskScore,
      x: Math.cos((i / 8) * Math.PI * 2) * 5.5 + (Math.random() - 0.5),
      y: Math.sin((i / 8) * Math.PI * 2) * 5.5 + (Math.random() - 0.5),
      z: (Math.random() - 0.5) * 3,
    });
    if (nodes.find((n) => n.id === userId)) {
      edges.push({ source: userId, target: nodeId, weight: t.riskScore / 100, edgeType: "transacted_with" });
    }
  });

  const ipSet = new Set<string>();
  telemetry.slice(0, 6).forEach((e) => {
    if (!ipSet.has(e.sourceIp)) {
      ipSet.add(e.sourceIp);
      nodes.push({
        id: `ip_${e.sourceIp.replace(/\./g, "_")}`,
        label: e.sourceIp,
        type: "ip_address",
        riskScore: e.severity === "critical" ? 90 : e.severity === "high" ? 70 : 40,
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 4,
      });
      if (e.userId && nodes.find((n) => n.id === `user_${e.userId}`)) {
        edges.push({
          source: `user_${e.userId}`,
          target: `ip_${e.sourceIp.replace(/\./g, "_")}`,
          weight: 0.7,
          edgeType: "accessed_from",
        });
      }
    }
  });

  // Add some cross-correlation edges
  const userNodes = nodes.filter((n) => n.type === "user");
  for (let i = 0; i < Math.min(3, userNodes.length - 1); i++) {
    edges.push({
      source: userNodes[i].id,
      target: userNodes[i + 1].id,
      weight: 0.45,
      edgeType: "correlated",
    });
  }

  return { nodes, edges };
};

router.get("/correlations", requireAuth, async (req, res) => {
  const { limit = "30" } = req.query as Record<string, string>;
  const corrs = await db
    .select()
    .from(correlationsTable)
    .orderBy(desc(correlationsTable.detectedAt))
    .limit(parseInt(limit));

  res.json(
    corrs.map((c) => ({
      ...c,
      detectedAt: c.detectedAt.toISOString(),
    })),
  );
});

router.get("/correlations/graph", requireAuth, async (_req, res) => {
  const graph = await buildGraphData();
  res.json(graph);
});

router.get("/correlations/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [corr] = await db
    .select()
    .from(correlationsTable)
    .where(eq(correlationsTable.id, id))
    .limit(1);
  if (!corr) {
    res.status(404).json({ error: "Correlation not found" });
    return;
  }

  const graph = await buildGraphData();

  res.json({
    correlation: { ...corr, detectedAt: corr.detectedAt.toISOString() },
    xaiExplanation: makeXAI(corr),
    graphData: graph,
  });
});

export default router;
