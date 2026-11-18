import { Router } from "express";
import * as events from "../controllers/eventController";
import { requireAuth, requireEdit } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", events.list);
router.post("/", requireEdit, events.create);
router.get("/:id", events.get);
router.patch("/:id", requireEdit, events.update);
router.post("/:id/seating/generate", requireEdit, events.generate);
router.patch("/:id/seating/:planId", requireEdit, events.saveSeating);

export default router;
