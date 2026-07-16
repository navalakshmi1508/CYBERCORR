# CyberNexus AI

An AI-driven cybersecurity threat intelligence platform for banks. Correlates cybersecurity telemetry (login attempts, network anomalies, endpoint alerts) with transactional behaviour (fraud, structuring, ATO) using Graph Neural Network-inspired analysis and Explainable AI. Features quantum risk monitoring, 3D correlation graph visualization, and a real-time analyst feedback loop.

## Run & Operate

- `pnpm --filter @workspace/cybernexus run dev` — frontend (port auto-assigned via PORT env)
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + Recharts + Three.js
- API: Express 5 + JWT auth (jsonwebtoken + bcryptjs)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec in lib/api-spec/openapi.yaml)

## Demo Credentials

All accounts use password: `password123`

| Email | Role | Access |
|-------|------|--------|
| analyst@cybernexus.ai | Analyst | Full: all alerts, XAI, feedback, graph, quantum |
| sarah.analyst@cybernexus.ai | Analyst | Full analyst access |
| user@bank.com | User | Own transactions & alerts only |
| emma.johnson@bank.com | User | Own transactions & alerts only |
| admin@cybernexus.ai | Admin | Full access |

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB tables: users, telemetry_events, transactions, alerts, correlations, quantum_risks, notifications
- `artifacts/api-server/src/routes/` — Express route handlers (auth, dashboard, telemetry, transactions, alerts, correlations, quantum, notifications, users)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT middleware + role guards
- `artifacts/cybernexus/src/` — React frontend

## Architecture decisions

- JWT auth stored in localStorage under key `cybernexus_user` (JSON: {token, user})
- custom-fetch.ts auto-reads token from localStorage and attaches as Bearer header
- Analyst role gates: feedback submission, user list, full alert/transaction visibility
- XAI explanations are generated server-side from alert/transaction metadata (no external AI call)
- Graph data for 3D visualization computed from live DB entities (users, transactions, IPs)
- Quantum simulation results are deterministic computations based on DB quantum_risks table

## Product

- **Login/Register** — animated particle canvas background, demo credential quick-fill, role selection
- **Dashboard** — risk score gauge, alert trend AreaChart, threat RadarChart, top threats table
- **Telemetry** — live event feed, filterable by severity/type, color-coded severity badges
- **Transactions** — anomaly table, XAI risk factor breakdown per transaction, related alerts
- **Alerts** — full alert center, XAI explanation + correlation path, analyst TP/FP feedback
- **Correlations** — 3D GNN graph (Three.js), correlated threat cluster list
- **Quantum** — quantum risk list, 3D torus knot animation, simulation results panel
- **Notifications** — per-user notification center with mark-as-read
- **Users** — analyst-only user registry with role badges

## User preferences

- Dark ops / military intelligence aesthetic with electric cyan (#00f5ff) primary color
- JetBrains Mono for data labels, Inter for prose
- No emojis anywhere in the UI

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any openapi.yaml change
- Password hashing uses bcryptjs (not bcrypt) — already in api-server dependencies
- The `cybernexus_user` localStorage key must contain `{token, user: {role}}` for auth to work
- Analyst-only routes use `requireAnalyst` middleware — returns 403 for user role
