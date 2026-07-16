import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth, requireAnalyst } from "../middlewares/auth";

const router = Router();

router.get("/users", requireAuth, requireAnalyst, async (_req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      department: usersTable.department,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  res.json(
    users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
  );
});

export default router;
