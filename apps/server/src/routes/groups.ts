import { Router } from "express";
import * as groups from "../controllers/groupController";
import { requireAdmin, requireAuth, requireEdit } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", groups.list);
router.post("/", requireEdit, groups.create);
router.patch("/:id", requireEdit, groups.update);
router.post("/:id/members", requireEdit, groups.addMembers);
router.patch("/:id/archive", requireEdit, groups.archive);
router.patch("/:id/restore", requireEdit, groups.restore);
router.delete("/:id", requireAdmin, groups.remove);

export default router;
