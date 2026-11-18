import { Router } from "express";
import * as members from "../controllers/memberController";
import { requireAdmin, requireAuth, requireEdit } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", members.list);
router.get("/:id", members.get);
router.post("/", requireEdit, members.create);
router.patch("/:id", requireEdit, members.update);
router.patch("/:id/archive", requireEdit, members.archive);
router.patch("/:id/restore", requireEdit, members.restore);
router.delete("/:id", requireAdmin, members.remove);

export default router;
