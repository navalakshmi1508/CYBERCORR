import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import telemetryRouter from "./telemetry";
import transactionsRouter from "./transactions";
import alertsRouter from "./alerts";
import correlationsRouter from "./correlations";
import quantumRouter from "./quantum";
import notificationsRouter from "./notifications";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(telemetryRouter);
router.use(transactionsRouter);
router.use(alertsRouter);
router.use(correlationsRouter);
router.use(quantumRouter);
router.use(notificationsRouter);
router.use(usersRouter);

export default router;
