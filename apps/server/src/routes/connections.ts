import { Router } from "express";
import * as connections from "../controllers/connectionController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", connections.list);
router.post("/", connections.upsert);
router.delete("/:id", connections.remove);

export default router;
