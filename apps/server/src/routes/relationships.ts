import { Router } from "express";
import * as relationships from "../controllers/relationshipController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", relationships.list);
router.post("/", relationships.create);
router.delete("/:id", relationships.remove);

export default router;
