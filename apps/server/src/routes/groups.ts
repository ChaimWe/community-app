import { Router } from "express";
import * as groups from "../controllers/groupController";
import { requireAuth, requireEdit } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", groups.list);
router.post("/", requireEdit, groups.create);
router.patch("/:id", requireEdit, groups.update);
router.post("/:id/members", requireEdit, groups.addMembers);

export default router;
