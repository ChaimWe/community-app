import { Router } from "express";
import * as events from "../controllers/eventController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", events.list);
router.post("/", events.create);
router.get("/:id", events.get);
router.patch("/:id", events.update);
router.post("/:id/seating/generate", events.generate);
router.patch("/:id/seating/:planId", events.saveSeating);

export default router;
