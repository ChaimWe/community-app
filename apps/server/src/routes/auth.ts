import { Router } from "express";
import { googleCallback, googleStart, loginController, logoutController, meController } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/google", googleStart);
router.get("/google/callback", googleCallback);
router.get("/me", requireAuth, meController);

export default router;
