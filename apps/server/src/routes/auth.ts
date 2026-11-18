import { Router } from "express";
import {
  approveUserController,
  createPendingUserController,
  listUsersController,
  loginController,
  logoutController,
  meController,
} from "../controllers/authController";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", loginController);
router.post("/register", createPendingUserController);
router.post("/logout", logoutController);
router.get("/me", requireAuth, meController);
router.get("/users", requireAuth, requireAdmin, listUsersController);
router.patch("/users/:id/approval", requireAuth, requireAdmin, approveUserController);

export default router;
