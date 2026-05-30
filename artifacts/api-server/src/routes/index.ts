import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inquiriesRouter from "./inquiries";
import projectsRouter from "./projects";
import servicesRouter from "./services";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/inquiries", inquiriesRouter);
router.use("/projects", projectsRouter);
router.use("/services", servicesRouter);
router.use("/admin", adminRouter);

export default router;
