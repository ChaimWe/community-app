import { Router } from "express";
import * as members from "../controllers/memberController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", members.list);
router.get("/:id", members.get);
router.post("/", members.create);
router.patch("/:id", members.update);
router.delete("/:id", members.remove);

export default router;
