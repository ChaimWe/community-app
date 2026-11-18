import { Router } from "express";
import * as connections from "../controllers/connectionController";
import { requireAuth, requireEdit } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", connections.list);
router.post("/", requireEdit, connections.upsert);
router.delete("/:id", requireEdit, connections.remove);

export default router;
