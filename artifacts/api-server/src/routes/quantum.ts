import { Router } from "express";
import { db } from "@workspace/db";
import { quantumRisksTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/quantum/risks", requireAuth, async (_req, res) => {
  const risks = await db
    .select()
    .from(quantumRisksTable)
    .orderBy(desc(quantumRisksTable.detectedAt));

  res.json(
    risks.map((r) => ({
      ...r,
      detectedAt: r.detectedAt.toISOString(),
    })),
  );
});

router.get("/quantum/simulation", requireAuth, async (_req, res) => {
  const risks = await db.select().from(quantumRisksTable);
  const unresolved = risks.filter((r) => !r.isResolved);

  const riskByAlgorithm = [
    { category: "RSA-2048", count: 4, percentage: 32 },
    { category: "AES-128", count: 2, percentage: 16 },
    { category: "ECC-256", count: 3, percentage: 24 },
    { category: "DES/3DES", count: 2, percentage: 16 },
    { category: "MD5/SHA-1", count: 1, percentage: 8 },
    { category: "TLS 1.0/1.1", count: 1, percentage: 4 },
  ];

  res.json({
    simulationId: `QSim-${Date.now().toString(36).toUpperCase()}`,
    overallQuantumRiskScore: Math.min(100, unresolved.length * 14 + 28),
    vulnerableDataFlows: unresolved.length + 7,
    estimatedDecryptionTime: "3-7 years with Q=10,000 qubit system",
    riskByAlgorithm,
    affectedAssets: [
      "Core Banking API Gateway",
      "Customer Data Encryption Layer",
      "Inter-bank SWIFT Communication",
      "Authentication Token Infrastructure",
      "Archive Data Store (2019-2022)",
      "Mobile Banking TLS Channels",
    ],
    recommendedMigrations: [
      "Migrate RSA-2048 to CRYSTALS-Kyber (NIST PQC Standard)",
      "Replace ECC-256 with CRYSTALS-Dilithium for digital signatures",
      "Upgrade TLS to 1.3 with post-quantum cipher suites",
      "Implement hybrid classical-quantum key exchange",
      "Audit and replace MD5/SHA-1 hashes in legacy archives",
      "Deploy quantum-resistant HSMs for key management",
    ],
    runAt: new Date().toISOString(),
  });
});

export default router;
