import { Router } from "express";
import {
  approveUserController,
  changePasswordController,
  createPendingUserController,
  listUsersController,
  loginController,
  logoutController,
  meController,
  resetPasswordController,
} from "../controllers/authController";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", loginController);
router.post("/register", createPendingUserController);
router.post("/logout", logoutController);
router.patch("/password", requireAuth, changePasswordController);
router.get("/me", requireAuth, meController);
router.get("/users", requireAuth, requireAdmin, listUsersController);
router.patch("/users/:id/approval", requireAuth, requireAdmin, approveUserController);
router.patch("/users/:id/password", requireAuth, requireAdmin, resetPasswordController);

export default router;
