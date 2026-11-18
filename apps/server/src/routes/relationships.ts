import { Router } from "express";
import * as relationships from "../controllers/relationshipController";
import { requireAuth, requireEdit } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", relationships.list);
router.post("/", requireEdit, relationships.create);
router.delete("/:id", requireEdit, relationships.remove);

export default router;
