import { Router } from "express";
import guestController from "../controllers/guestController";

const router = Router();

router.use("/guests", guestController);

export default router;
