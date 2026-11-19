import { Router } from "express";
import * as events from "../controllers/eventController";
import { requireAdmin, requireAuth, requireEdit } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", events.list);
router.post("/", requireEdit, events.create);
router.get("/:id", events.get);
router.patch("/:id", requireEdit, events.update);
router.patch("/:id/archive", requireEdit, events.archive);
router.patch("/:id/restore", requireEdit, events.restore);
router.delete("/:id", requireAdmin, events.remove);
router.post("/:id/seating/generate", requireEdit, events.generate);
router.patch("/:id/seating/:planId", requireEdit, events.saveSeating);

export default router;
