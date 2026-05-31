import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inquiriesRouter from "./inquiries";
import projectsRouter from "./projects";
import servicesRouter from "./services";
import adminRouter from "./admin";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/inquiries", inquiriesRouter);
router.use("/projects", projectsRouter);
router.use("/services", servicesRouter);
router.use("/admin", adminRouter);
router.use("/storage", storageRouter);

export default router;
