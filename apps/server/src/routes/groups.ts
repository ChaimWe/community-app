import { Router } from "express";
import * as groups from "../controllers/groupController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", groups.list);
router.post("/", groups.create);
router.patch("/:id", groups.update);
router.post("/:id/members", groups.addMembers);

export default router;
