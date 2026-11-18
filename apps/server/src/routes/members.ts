import { Router } from "express";
import * as members from "../controllers/memberController";
import { requireAuth, requireEdit } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", members.list);
router.get("/:id", members.get);
router.post("/", requireEdit, members.create);
router.patch("/:id", requireEdit, members.update);
router.delete("/:id", requireEdit, members.remove);

export default router;
